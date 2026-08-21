<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderFieldValue;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\Voucher;
    use App\Services\Payment\PaymentGatewayInterface;
    use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentGatewayInterface $paymentGateway
    ) {}

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'duration_id' => ['required', 'integer', 'exists:product_durations,id'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            // customer_email tidak dikumpulkan dari guest — notifikasi via WhatsApp
            'whatsapp' => ['required', 'string', 'max:20'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
            'fields' => ['nullable', 'array'],
            'fields.*' => ['nullable', 'string', 'max:500'],
        ]);

        $product = Product::with('fields')->where('status', 'active')->findOrFail($request->product_id);

        // Validasi Maintenance (Backend)
        if ($product->platform_type === 'maintenance') {
            return back()->with('error', 'Maaf, produk "' . $product->name . '" sedang dalam pemeliharaan (maintenance) dan tidak dapat dibeli saat ini.');
        }

        $duration = ProductDuration::where('product_id', $product->id)
            ->where('is_active', true)
            ->findOrFail($request->duration_id);

        // Validasi Stok (Backend)
        if ($duration->keys()->available()->count() === 0) {
            return back()->with('error', 'Maaf, stok untuk paket "' . $duration->name . '" baru saja habis. Silakan pilih paket lain.');
        }

        $gateway = app(PaymentGatewayInterface::class);
        $defaultMethod = match ($gateway->getGatewayName()) {
            'genspay' => 'qris',
            default => 'MOCK_QRIS',
        };
        $paymentMethod = $request->payment_method ?? $defaultMethod;

        // Validasi voucher awal (tanpa lock) — validasi definitif ada di dalam transaksi
        $voucherCode = $request->filled('voucher_code')
            ? strtoupper(trim($request->voucher_code))
            : null;

        $authUser = Auth::user();
        $isResellerEligible = $authUser && $authUser->tier && (int) $authUser->tier->level >= 2;
        $basePrice = ($isResellerEligible && $duration->reseller_price !== null && (float) $duration->reseller_price > 0)
            ? (float) $duration->reseller_price
            : (float) $duration->price;

        if ($voucherCode) {
            $preCheckVoucher = Voucher::with('products')->where('code', $voucherCode)->first();
            if (! $preCheckVoucher) {
                return back()->withErrors(['voucher_code' => 'Voucher tidak ditemukan.']);
            }
            if (! $preCheckVoucher->is_active) {
                return back()->withErrors(['voucher_code' => 'Voucher sudah dinonaktifkan.']);
            }
            if ($preCheckVoucher->expired_at && $preCheckVoucher->expired_at <= now()) {
                return back()->withErrors(['voucher_code' => 'Voucher sudah kadaluarsa.']);
            }
            if ($preCheckVoucher->quota !== null && $preCheckVoucher->used >= $preCheckVoucher->quota) {
                return back()->withErrors(['voucher_code' => 'Kuota voucher sudah habis.']);
            }
            if ($preCheckVoucher->products->isNotEmpty() && !$preCheckVoucher->products->contains('id', $product->id)) {
                return back()->withErrors(['voucher_code' => 'Voucher ini tidak berlaku untuk produk yang Anda pilih.']);
            }
            if ($preCheckVoucher->min_transaction && $basePrice < $preCheckVoucher->min_transaction) {
                return back()->withErrors(['voucher_code' => 'Minimum transaksi untuk voucher ini adalah Rp '.number_format($preCheckVoucher->min_transaction, 0, ',', '.')]);
            }
        }

        try {
            $order = DB::transaction(function () use ($request, $product, $duration, $voucherCode, $paymentMethod, $basePrice, $authUser) {
                // Lock voucher di dalam transaksi untuk cegah race condition
                $voucher = null;
                $discountAmount = 0;
                $finalPrice = $basePrice;

                if ($voucherCode) {
                    $voucher = Voucher::active()
                        ->where('code', $voucherCode)
                        ->lockForUpdate()
                        ->first();

                    if (! $voucher) {
                        throw new \Exception('Voucher tidak valid (sudah habis atau kadaluarsa).');
                    }

                    $discountAmount = $voucher->type === 'percent'
                        ? ($finalPrice * $voucher->value / 100)
                        : $voucher->value;

                    $discountAmount = min($discountAmount, $finalPrice);
                    $finalPrice = max(0, $finalPrice - $discountAmount);

                    $voucher->increment('used');
                }

                $authUser = Auth::user();
                $memberUserId = ($authUser && $authUser->hasRole('member')) ? $authUser->id : null;

                $feeAmount = 0;
                if ($paymentMethod !== 'balance' && !str_starts_with($paymentMethod, 'manual_')) {
                    $gatewayInstance = app(PaymentGatewayInterface::class);
                    $channels = $gatewayInstance->getPaymentChannels();
                    $selectedChannel = collect($channels)->firstWhere('code', $paymentMethod);
                    if ($selectedChannel) {
                        $feeFlat = (float) ($selectedChannel['fee'] ?? 0);
                        $feePct = (float) ($selectedChannel['fee_pct'] ?? 0);
                        $feeAmount = $feeFlat + ($finalPrice * $feePct / 100);
                    }
                }
                
                $totalPriceWithFee = $finalPrice + $feeAmount;

                if ($paymentMethod === 'balance') {
                    if (!$authUser || !$authUser->hasRole('member')) {
                        throw new \Exception('Metode pembayaran saldo hanya untuk member.');
                    }
                    if ((float) $authUser->balance < (float) $totalPriceWithFee) {
                        throw new \Exception('Saldo Anda tidak cukup untuk melakukan pembelian ini.');
                    }

                    // Potong saldo
                    $authUser->decrement('balance', $totalPriceWithFee);
                }

                $order = Order::create([
                    'user_id' => $memberUserId,
                    'customer_name' => $request->customer_name,
                    // customer_email tidak dikumpulkan — notifikasi via WhatsApp
                    'customer_phone' => $request->whatsapp,
                    'whatsapp_number' => $request->whatsapp,
                    'total_price' => $totalPriceWithFee,
                    'fee_amount' => $feeAmount,
                    'discount_amount' => $discountAmount,
                    'status' => $paymentMethod === 'balance' ? \App\Enums\OrderStatus::PAID : 'unpaid',
                    'payment_method' => $paymentMethod,
                    'voucher_id' => $voucher?->id,
                    'ip_address' => request()->ip(),
                ]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_duration_id' => $duration->id,
                    'product_name' => $product->name,
                    'duration_name' => $duration->name,
                    'price' => $basePrice,
                    'quantity' => 1,
                ]);

                if (! empty($request->fields) && is_array($request->fields)) {
                    // Hanya simpan field yang benar-benar milik produk ini (cegah injeksi field asing)
                    $validFieldIds = $product->fields->pluck('id')->map(fn ($id) => (string) $id)->toArray();

                    foreach ($request->fields as $fieldId => $value) {
                        if (! in_array((string) $fieldId, $validFieldIds, true)) {
                            continue;
                        }
                        if (! empty($value)) {
                            OrderFieldValue::create([
                                'order_id' => $order->id,
                                'product_field_id' => (int) $fieldId,
                                'value' => $value,
                            ]);
                        }
                    }
                }

                return $order;
            });

            // Buat transaksi pembayaran via gateway (di luar DB transaction utama)
            $order->load('items');
            if ($paymentMethod === 'balance') {
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'gateway' => 'internal',
                    'reference_id' => 'BAL-' . $order->invoice_code,
                    'amount' => $order->total_price,
                    'status' => 'success',
                    'paid_at' => now(),
                    'payload' => ['method' => 'balance'],
                ]);

                $order->update([
                    'payment_reference' => $payment->reference_id,
                ]);

                \App\Jobs\DeliverOrderKeysJob::dispatchSync($order->fresh());
            } elseif (str_starts_with($paymentMethod, 'manual_')) {
                $manualId = (int) str_replace('manual_', '', $paymentMethod);
                $manualMethod = \App\Models\ManualPaymentMethod::find($manualId);

                if (!$manualMethod || !$manualMethod->is_active) {
                    $this->rollbackCheckoutOrder($order);
                    return back()->with('error', 'Metode pembayaran manual tidak valid atau sudah dinonaktifkan.');
                }

                $payment = Payment::create([
                    'order_id' => $order->id,
                    'gateway' => 'manual',
                    'reference_id' => 'MAN-' . $order->invoice_code,
                    'amount' => $order->total_price,
                    'status' => 'pending',
                    'payload' => [
                        'method_id' => $manualMethod->id,
                        'name' => $manualMethod->name,
                        'account_number' => $manualMethod->account_number,
                        'account_name' => $manualMethod->account_name,
                        'instructions' => $manualMethod->instructions,
                    ],
                ]);

                $order->update([
                    'payment_reference' => $payment->reference_id,
                    'payment_expired_at' => now()->addHours(24),
                ]);
            } else {
                try {
                    $this->createPayment($order, $paymentMethod);
                } catch (\Throwable $e) {
                    $this->rollbackCheckoutOrder($order);
                    return back()->with('error', 'Gagal membuat sesi pembayaran: ' . $e->getMessage());
                }
            }



            $order->load(['items.product', 'items.duration', 'fieldValues.field']);
            $whatsappUrl = $this->generateWhatsappConfirmationUrl($order);

            return redirect()->route('orders.status', $order->invoice_code)
                ->with('success', 'Pesanan berhasil dibuat! Silakan selesaikan pembayaran.')
                ->with('whatsapp_url', $whatsappUrl);
        } catch (\Throwable $e) {
            Log::error("CheckoutController: Gagal proses checkout — {$e->getMessage()}");

            return back()->withErrors(['error' => 'Gagal memproses pesanan. Silakan coba lagi.']);
        }
    }

    protected function createPayment(Order $order, string $paymentMethod): void
    {
        $txData = $this->paymentGateway->createTransaction($order, $paymentMethod);

        Payment::create([
            'order_id' => $order->id,
            'gateway' => $this->paymentGateway->getGatewayName(),
            'reference_id' => $txData['reference_id'],
            'amount' => $order->total_price,
            'status' => 'pending',
            'payload' => $txData['payload'] ?? null,
        ]);

        $order->update([
            'payment_reference' => $txData['reference_id'],
            'payment_url' => $txData['payment_url'] ?? null,
            'payment_expired_at' => $txData['expired_at'] ?? null,
        ]);
    }

    /**
     * Batalkan order jika gateway gagal — kembalikan kuota voucher.
     */
    protected function rollbackCheckoutOrder(Order $order): void
    {
        try {
            DB::transaction(function () use ($order) {
                if ($order->voucher_id) {
                    Voucher::where('id', $order->voucher_id)->where('used', '>', 0)->decrement('used');
                }
                $order->delete();
            });
        } catch (\Throwable $e) {
            Log::error("CheckoutController: Gagal rollback order #{$order->invoice_code} — {$e->getMessage()}");
        }
    }

    /**
     * Generate WhatsApp confirmation message URL
     */
    protected function generateWhatsappConfirmationUrl(Order $order): ?string
    {
        $adminNumber = \App\Models\Setting::get('whatsapp_number');
        if (! $adminNumber) return null;

        $productNames = $order->items->map(fn($item) => $item->product_name)->implode(', ');
        $priceFormatted = "Rp " . number_format($order->total_price, 0, ',', '.');
        $statusUrl = route('orders.status', $order->invoice_code);

        $message = "*Hallo mohon segera melakukan pelunasan pesanan Anda.*\n\n";
        $message .= "Rincian Pesanan Sbb.\n";
        $message .= "No Invoce : {$order->invoice_code}\n";
        $message .= "Nama Produk : {$productNames}\n";
        $message .= "Harga : {$priceFormatted}\n\n";
        $message .= "*UNTUK PEMBAYARAN SILAHKAN BUKA LINK BERIKUT :*\n";
        $message .= "{$statusUrl}\n\n";
        $message .= "*Setelah pembayaran, Key Bisa Dilihat Di link web diatas*\n\n";
        $message .= "> Ada kendala hub admin : 083871820682";

        $cleanNumber = preg_replace('/\D/', '', $adminNumber);
        if (str_starts_with($cleanNumber, '0')) {
            $cleanNumber = '62' . substr($cleanNumber, 1);
        }

        return "https://api.whatsapp.com/send?phone={$cleanNumber}&text=" . urlencode($message);
    }
}
