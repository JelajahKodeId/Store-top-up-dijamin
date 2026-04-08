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
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentGatewayInterface $paymentGateway,
        protected WhatsAppService $whatsApp,
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
        $duration = ProductDuration::where('product_id', $product->id)
            ->where('is_active', true)
            ->findOrFail($request->duration_id);

        $gateway = app(PaymentGatewayInterface::class);
        $defaultMethod = match ($gateway->getGatewayName()) {
            'tripay' => 'QRIS',
            'midtrans' => 'midtrans_snap',
            default => 'MOCK_QRIS',
        };
        $paymentMethod = $request->payment_method ?? $defaultMethod;

        // Validasi voucher awal (tanpa lock) — validasi definitif ada di dalam transaksi
        $voucherCode = $request->filled('voucher_code')
            ? strtoupper(trim($request->voucher_code))
            : null;

        if ($voucherCode) {
            $preCheckVoucher = Voucher::active()->where('code', $voucherCode)->first();
            if (! $preCheckVoucher) {
                return back()->withErrors(['voucher_code' => 'Voucher tidak valid atau sudah kadaluarsa.']);
            }
            if ($preCheckVoucher->min_transaction && $duration->price < $preCheckVoucher->min_transaction) {
                return back()->withErrors(['voucher_code' => 'Minimum transaksi untuk voucher ini adalah Rp '.number_format($preCheckVoucher->min_transaction, 0, ',', '.')]);
            }
        }

        try {
            $order = DB::transaction(function () use ($request, $product, $duration, $voucherCode, $paymentMethod) {
                // Lock voucher di dalam transaksi untuk cegah race condition
                $voucher = null;
                $discountAmount = 0;
                $finalPrice = $duration->price;

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

                $order = Order::create([
                    'customer_name' => $request->customer_name,
                    // customer_email tidak dikumpulkan — notifikasi via WhatsApp
                    'customer_phone' => $request->whatsapp,
                    'whatsapp_number' => $request->whatsapp,
                    'total_price' => $finalPrice,
                    'discount_amount' => $discountAmount,
                    'status' => 'unpaid',
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
                    'price' => $duration->price,
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
            if (! $this->createPayment($order, $paymentMethod)) {
                $this->rollbackCheckoutOrder($order);

                return back()->with(
                    'error',
                    'Gagal membuka sesi pembayaran. Periksa MIDTRANS_SERVER_KEY / jaringan, lalu coba lagi.'
                );
            }

            // Kirim notifikasi WA ke customer + admin (non-blocking, tidak menghentikan flow)
            try {
                $this->whatsApp->sendOrderCreated($order->fresh(['items', 'fieldValues.field']));
            } catch (\Throwable $e) {
                Log::warning("Checkout: WA notification gagal — {$e->getMessage()}");
            }

            return redirect()->route('orders.status', $order->invoice_code)
                ->with('success', 'Pesanan berhasil dibuat! Silakan selesaikan pembayaran.');
        } catch (\Throwable $e) {
            Log::error("CheckoutController: Gagal proses checkout — {$e->getMessage()}");

            return back()->withErrors(['error' => 'Gagal memproses pesanan. Silakan coba lagi.']);
        }
    }

    protected function createPayment(Order $order, string $paymentMethod): bool
    {
        try {
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

            return true;
        } catch (\Throwable $e) {
            Log::error("CheckoutController: Gagal buat payment untuk order #{$order->invoice_code} — {$e->getMessage()}");

            return false;
        }
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
}
