<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\MemberTierUpgrade;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\WalletTopup;
use App\Services\KeyDeliveryService;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentGatewayInterface $paymentGateway,
        protected KeyDeliveryService $keyDeliveryService
    ) {}

    /**
     * Notifikasi pembayaran dari gateway (Midtrans, Tripay, dll).
     * CSRF dikecualikan — validasi lewat verifyWebhook() per gateway.
     */
    public function handle(Request $request): Response
    {
        Log::debug('WebhookController: Incoming request', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
            'body' => $request->all(),
        ]);

        $parsed = $this->paymentGateway->verifyWebhook($request);

        if ($parsed === null) {
            Log::warning('WebhookController: Webhook tidak valid dari '.$request->ip());

            return response('Invalid signature', 403);
        }

        $referenceId = $parsed['reference_id'];
        $status = $parsed['status'];

        $payment = Payment::where('reference_id', $referenceId)->first();

        if ($payment) {
            // Validasi kecocokan nominal (Amount) untuk mencegah fraud
            if (isset($parsed['raw']['amount']) || isset($parsed['raw']['gross_amount'])) {
                $notified = (int) round((float) ($parsed['raw']['amount'] ?? $parsed['raw']['gross_amount']));
                $expected = (int) round((float) $payment->amount);

                if ($notified !== $expected) {
                    Log::warning("WebhookController: Amount mismatch for {$referenceId} (Gateway: {$payment->gateway}, Notified: {$notified}, Expected: {$expected})");

                    return response('Amount mismatch', 400);
                }
            }

            $order = $payment->order;

            if ($order->status !== OrderStatus::UNPAID) {
                Log::info("WebhookController: Order #{$order->invoice_code} sudah diproses (status: {$order->status->value}), diabaikan.");

                return response('OK', 200);
            }

            if ($status === 'pending') {
                Log::info("WebhookController: Notifikasi pending untuk {$referenceId} — order tetap unpaid.");

                return response('OK', 200);
            }

            if ($status === 'paid') {
                $this->handlePaidWebhook($order, $payment, $parsed['raw']);
            } elseif ($status === 'failed' || $status === 'expired') {
                $this->handleFailedWebhook($order, $payment, $status);
            }

            return response('OK', 200);
        }

        $topup = WalletTopup::query()
            ->where('gateway_payment_reference', $referenceId)
            ->orWhere('invoice_code', $referenceId)
            ->first();

        if ($topup) {
            if (isset($parsed['raw']['amount']) || isset($parsed['raw']['gross_amount'])) {
                $notified = (int) round((float) ($parsed['raw']['amount'] ?? $parsed['raw']['gross_amount']));
                $expected = (int) round((float) $topup->amount);

                if ($notified !== $expected) {
                    Log::warning("WebhookController: Topup amount mismatch for {$referenceId} (Notified: {$notified}, Expected: {$expected})");

                    return response('Amount mismatch', 400);
                }
            }

            if ($topup->status !== 'pending') {
                Log::info("WebhookController: Topup #{$topup->invoice_code} sudah diproses ({$topup->status}), diabaikan.");

                return response('OK', 200);
            }

            if ($status === 'pending') {
                return response('OK', 200);
            }

            if ($status === 'paid') {
                $this->handlePaidWalletTopup($topup, $parsed['raw']);
            } elseif ($status === 'failed' || $status === 'expired') {
                $topup->update([
                    'status' => 'failed',
                    'payload' => array_merge($topup->payload ?? [], ['gateway_status' => $status, 'webhook' => $parsed['raw']]),
                ]);
            }

            return response('OK', 200);
        }

        $tierUpgrade = MemberTierUpgrade::query()
            ->where('gateway_payment_reference', $referenceId)
            ->orWhere('invoice_code', $referenceId)
            ->first();

        if (! $tierUpgrade) {
            Log::warning("WebhookController: Payment / topup / upgrade dengan reference {$referenceId} tidak ditemukan");

            return response('Payment not found', 404);
        }

        if (isset($parsed['raw']['amount']) || isset($parsed['raw']['gross_amount'])) {
            $notified = (int) round((float) ($parsed['raw']['amount'] ?? $parsed['raw']['gross_amount']));
            $expected = (int) round((float) $tierUpgrade->amount);

            if ($notified !== $expected) {
                Log::warning("WebhookController: Tier upgrade amount mismatch for {$referenceId} (Notified: {$notified}, Expected: {$expected})");

                return response('Amount mismatch', 400);
            }
        }

        if ($tierUpgrade->status !== 'pending') {
            Log::info("WebhookController: Tier upgrade #{$tierUpgrade->invoice_code} sudah diproses ({$tierUpgrade->status}), diabaikan.");

            return response('OK', 200);
        }

        if ($status === 'pending') {
            return response('OK', 200);
        }

        if ($status === 'paid') {
            $this->handlePaidMemberTierUpgrade($tierUpgrade, $parsed['raw']);
        } elseif ($status === 'failed' || $status === 'expired') {
            $tierUpgrade->update([
                'status' => 'failed',
                'payload' => array_merge($tierUpgrade->payload ?? [], ['gateway_status' => $status, 'webhook' => $parsed['raw']]),
            ]);
        }

        return response('OK', 200);
    }

    /**
     * Simulasi pembayaran sukses (order atau top up saldo) — hanya local/testing.
     */
    public function mock(string $invoice_code): RedirectResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $invoice_code = strtoupper(trim($invoice_code));

        if (str_starts_with($invoice_code, 'WTU-')) {
            $topup = WalletTopup::where('invoice_code', $invoice_code)->firstOrFail();
            $amount = (int) round((float) $topup->amount);
            $sub = Request::create('/webhooks/payment', 'POST', [], [], [], [
                'HTTP_X_CALLBACK_SIGNATURE' => 'mock',
                'CONTENT_TYPE' => 'application/json',
            ], json_encode([
                'reference' => $topup->gateway_payment_reference,
                'status' => 'paid',
                'amount' => $amount,
            ], JSON_THROW_ON_ERROR));

            app()->handle($sub);

            return redirect()->route('member.topup.show', $topup->invoice_code)
                ->with('success', 'Top up berhasil (simulasi).');
        }

        if (str_starts_with($invoice_code, 'MPK-')) {
            $upgrade = MemberTierUpgrade::where('invoice_code', $invoice_code)->firstOrFail();
            $amount = (int) round((float) $upgrade->amount);
            $sub = Request::create('/webhooks/payment', 'POST', [], [], [], [
                'HTTP_X_CALLBACK_SIGNATURE' => 'mock',
                'CONTENT_TYPE' => 'application/json',
            ], json_encode([
                'reference' => $upgrade->gateway_payment_reference,
                'status' => 'paid',
                'amount' => $amount,
            ], JSON_THROW_ON_ERROR));

            app()->handle($sub);

            return redirect()->route('member.packages.show', $upgrade->invoice_code)
                ->with('success', 'Paket berhasil diupgrade (simulasi).');
        }

        $order = Order::where('invoice_code', $invoice_code)->firstOrFail();
        $payment = Payment::where('order_id', $order->id)->where('status', 'pending')->first();
        if (! $payment) {
            return redirect()->route('orders.status', $order->invoice_code)
                ->with('info', 'Tidak ada pembayaran tertunda untuk invoice ini.');
        }

        $amount = (int) round((float) $payment->amount);
        $sub = Request::create('/webhooks/payment', 'POST', [], [], [], [
            'HTTP_X_CALLBACK_SIGNATURE' => 'mock',
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'reference' => $payment->reference_id,
            'status' => 'paid',
            'amount' => $amount,
        ], JSON_THROW_ON_ERROR));

        app()->handle($sub);

        return redirect()->route('orders.status', $order->invoice_code)
            ->with('success', 'Pembayaran berhasil (simulasi).');
    }

    protected function handlePaidWalletTopup(WalletTopup $topup, array $raw): void
    {
        try {
            DB::transaction(function () use ($topup, $raw) {
                $locked = WalletTopup::where('id', $topup->id)->lockForUpdate()->first();
                if ($locked->status !== 'pending') {
                    return;
                }

                $user = User::where('id', $locked->user_id)->lockForUpdate()->first();
                $user->increment('balance', $locked->amount);

                $locked->update([
                    'status' => 'success',
                    'paid_at' => now(),
                    'payload' => array_merge($locked->payload ?? [], ['webhook' => $raw]),
                ]);
            });

            Log::info("WebhookController: Topup #{$topup->invoice_code} sukses — saldo ditambahkan.");
        } catch (\Throwable $e) {
            Log::error("WebhookController: Gagal proses topup #{$topup->invoice_code} — {$e->getMessage()}");
        }
    }

    protected function handlePaidMemberTierUpgrade(MemberTierUpgrade $upgrade, array $raw): void
    {
        try {
            DB::transaction(function () use ($upgrade, $raw) {
                $locked = MemberTierUpgrade::where('id', $upgrade->id)->lockForUpdate()->first();
                if ($locked->status !== 'pending') {
                    return;
                }

                $user = User::where('id', $locked->user_id)->lockForUpdate()->first();
                $newTier = $locked->target_tier;
                $user->member_tier = $newTier;
                $user->save();

                $locked->update([
                    'status' => 'success',
                    'paid_at' => now(),
                    'payload' => array_merge($locked->payload ?? [], ['webhook' => $raw]),
                ]);
            });

            Log::info("WebhookController: Tier upgrade #{$upgrade->invoice_code} sukses.");
        } catch (\Throwable $e) {
            Log::error("WebhookController: Gagal proses tier upgrade #{$upgrade->invoice_code} — {$e->getMessage()}");
        }
    }

    /**
     * Simulasi pembayaran sukses untuk mode mock (development only).
     */
    public function pakKasirSimulate(string $invoiceCode): RedirectResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $model = Order::where('invoice_code', $invoiceCode)->first();
        $redirectRoute = 'orders.status';
        
        if (!$model) {
            $model = \App\Models\WalletTopup::where('invoice_code', $invoiceCode)->first();
            $redirectRoute = 'member.topup.show';
        }
        
        if (!$model) {
            $model = \App\Models\MemberTierUpgrade::where('invoice_code', $invoiceCode)->first();
            $redirectRoute = 'member.packages.show';
        }

        abort_unless($model, 404);
        $amount = (int) round((float) ($model->total_price ?? $model->amount));

        try {
            $response = Http::asJson()
                ->timeout(10)
                ->post('https://app.pakasir.com/api/paymentsimulation', [
                    'project' => config('services.pak_kasir.slug'),
                    'order_id' => $invoiceCode,
                    'amount' => $amount,
                    'api_key' => config('services.pak_kasir.api_key'),
                ]);

            if ($response->successful()) {
                return redirect()->route($redirectRoute, $invoiceCode)
                    ->with('success', 'Berhasil mengirim aba-aba simulasi ke Pak Kasir! Tunggu beberapa detik hingga webhook sampai.');
            }

            return redirect()->route($redirectRoute, $invoiceCode)
                ->with('error', 'Gagal kirim simulasi: '.$response->json('message', $response->status()));
                
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return redirect()->route($redirectRoute, $invoiceCode)
                ->with('error', 'Koneksi ke Pak Kasir terputus atau API sedang offline (Timeout 10d). Silakan coba lagi.');
        } catch (\Throwable $e) {
            return redirect()->route($redirectRoute, $invoiceCode)
                ->with('error', 'Gagal kirim simulasi: '.$e->getMessage());
        }
    }

    protected function handlePaidWebhook(Order $order, Payment $payment, array $payload): void
    {
        try {
            DB::transaction(function () use ($order, $payment, $payload) {
                $payment->update([
                    'status' => 'success',
                    'paid_at' => now(),
                    'payload' => $payload,
                ]);

                $order->update(['status' => OrderStatus::PAID]);
            });

            $this->keyDeliveryService->deliver($order->fresh());

            Log::info("WebhookController: Order #{$order->invoice_code} berhasil diproses (PAID → SUCCESS).");
        } catch (\Throwable $e) {
            Log::error("WebhookController: Gagal proses paid webhook untuk #{$order->invoice_code} — {$e->getMessage()}");
        }
    }

    protected function handleFailedWebhook(Order $order, Payment $payment, string $status): void
    {
        $payment->update(['status' => 'failed', 'payload' => ['gateway_status' => $status]]);
        $order->update(['status' => OrderStatus::FAILED, 'note' => "Pembayaran {$status} dari gateway."]);

        Log::info("WebhookController: Order #{$order->invoice_code} ditandai FAILED (gateway: {$status}).");
    }


}
