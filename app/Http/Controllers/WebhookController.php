<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Services\KeyDeliveryService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected PaymentGatewayInterface $paymentGateway,
        protected KeyDeliveryService $keyDeliveryService
    ) {}

    /**
     * Handle callback dari payment gateway (Tripay, Midtrans, dll).
     * CSRF dikecualikan — validasi dilakukan via HMAC signature dari raw body.
     *
     * PENTING: Tripay menghitung signature dari raw JSON body, bukan dari
     * array yang di-decode ulang. Ambil raw body SEBELUM parsing.
     */
    public function handle(Request $request): Response
    {
        $rawBody   = $request->getContent();
        $signature = $request->header('X-Callback-Signature') ?? $request->input('signature', '');

        // Validasi signature menggunakan raw body
        if (! $this->paymentGateway->validateWebhookSignature($rawBody, $signature)) {
            Log::warning('WebhookController: Invalid signature dari ' . $request->ip());
            return response('Invalid signature', 403);
        }

        // Payload di-parse setelah signature valid
        $payload     = json_decode($rawBody, true) ?? $request->all();
        $referenceId = $payload['reference'] ?? $payload['reference_id'] ?? null;
        $status      = strtolower($payload['status'] ?? '');

        if (! $referenceId) {
            Log::warning('WebhookController: reference_id tidak ada dalam payload');
            return response('Missing reference', 422);
        }

        $payment = Payment::where('reference_id', $referenceId)->first();

        if (! $payment) {
            Log::warning("WebhookController: Payment dengan reference {$referenceId} tidak ditemukan");
            return response('Payment not found', 404);
        }

        $order = $payment->order;

        // Idempotency check — abaikan jika sudah diproses
        if ($order->status !== OrderStatus::UNPAID) {
            Log::info("WebhookController: Order #{$order->invoice_code} sudah diproses (status: {$order->status->value}), diabaikan.");
            return response('OK', 200);
        }

        if ($status === 'paid' || $status === 'success' || $status === 'settlement') {
            $this->handlePaidWebhook($order, $payment, $payload);
        } elseif ($status === 'failed' || $status === 'cancel' || $status === 'expired') {
            $this->handleFailedWebhook($order, $payment, $status);
        }

        return response('OK', 200);
    }

    /**
     * Simulasi pembayaran sukses untuk mode mock (development only).
     * Endpoint: GET /webhooks/mock/{invoice_code}
     */
    public function mock(string $invoiceCode): \Illuminate\Http\RedirectResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $order = Order::where('invoice_code', $invoiceCode)->firstOrFail();

        if ($order->status !== OrderStatus::UNPAID) {
            return redirect()->route('orders.status', $invoiceCode)
                ->with('info', 'Pesanan ini sudah diproses sebelumnya.');
        }

        $payment = $order->payment;

        DB::transaction(function () use ($order, $payment) {
            if ($payment) {
                $payment->update(['status' => 'success', 'paid_at' => now()]);
            }

            $order->update(['status' => OrderStatus::PAID]);
        });

        try {
            $this->keyDeliveryService->deliver($order->fresh());
        } catch (\Throwable $e) {
            Log::error("WebhookController (mock): Gagal deliver key untuk #{$invoiceCode} — {$e->getMessage()}");
        }

        return redirect()->route('orders.status', $invoiceCode)
            ->with('success', 'Simulasi pembayaran berhasil! Key sudah dikirim.');
    }

    protected function handlePaidWebhook(Order $order, Payment $payment, array $payload): void
    {
        try {
            DB::transaction(function () use ($order, $payment, $payload) {
                $payment->update([
                    'status'  => 'success',
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
        $payment->update(['status' => 'failed', 'payload' => ['status' => $status]]);
        $order->update(['status' => OrderStatus::FAILED, 'note' => "Payment {$status} dari gateway."]);

        Log::info("WebhookController: Order #{$order->invoice_code} ditandai FAILED (gateway: {$status}).");
    }
}
