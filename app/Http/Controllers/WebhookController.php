<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Services\KeyDeliveryService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Http\RedirectResponse;
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
     * Notifikasi pembayaran dari gateway (Midtrans, Tripay, dll).
     * CSRF dikecualikan — validasi lewat verifyWebhook() per gateway.
     */
    public function handle(Request $request): Response
    {
        $parsed = $this->paymentGateway->verifyWebhook($request);

        if ($parsed === null) {
            Log::warning('WebhookController: Webhook tidak valid dari '.$request->ip());

            return response('Invalid signature', 403);
        }

        $referenceId = $parsed['reference_id'];
        $status = $parsed['status'];

        $payment = Payment::where('reference_id', $referenceId)->first();

        if (! $payment) {
            Log::warning("WebhookController: Payment dengan reference {$referenceId} tidak ditemukan");

            return response('Payment not found', 404);
        }

        if ($payment->gateway === 'midtrans' && isset($parsed['raw']['gross_amount'])) {
            $notified = (int) round((float) $parsed['raw']['gross_amount']);
            $expected = (int) round((float) $payment->amount);
            if ($notified !== $expected) {
                Log::warning("WebhookController: Midtrans gross_amount tidak cocok untuk {$referenceId}");

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

    /**
     * Simulasi pembayaran sukses untuk mode mock (development only).
     */
    public function mock(string $invoiceCode): RedirectResponse
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
