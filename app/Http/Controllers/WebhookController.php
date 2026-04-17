<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Services\KeyDeliveryService;
use App\Services\WhatsAppService;
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
        protected KeyDeliveryService $keyDeliveryService,
        protected WhatsAppService $whatsAppService
    ) {
    }

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
            Log::warning('WebhookController: Webhook tidak valid dari ' . $request->ip());

            return response('Invalid signature', 403);
        }

        $referenceId = $parsed['reference_id'];
        $status = $parsed['status'];

        $payment = Payment::where('reference_id', $referenceId)->first();

        if (!$payment) {
            Log::warning("WebhookController: Payment dengan reference {$referenceId} tidak ditemukan");

            return response('Payment not found', 404);
        }

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

    /**
     * Simulasi pembayaran sukses untuk mode mock (development only).
     */
    public function pakKasirSimulate(string $invoiceCode): RedirectResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $order = Order::where('invoice_code', $invoiceCode)->firstOrFail();
        $amount = (int) round((float) $order->total_price);

        $response = \Illuminate\Support\Facades\Http::asJson()->post('https://app.pakasir.com/api/paymentsimulation', [
            'project' => config('services.pak_kasir.slug'),
            'order_id' => $invoiceCode,
            'amount' => $amount,
            'api_key' => config('services.pak_kasir.api_key'),
        ]);

        if ($response->successful()) {
            return redirect()->route('orders.status', $invoiceCode)
                ->with('success', 'Berhasil mengirim aba-aba simulasi ke Pak Kasir! Tunggu beberapa detik hingga webhook sampai.');
        }

        return redirect()->route('orders.status', $invoiceCode)
            ->with('error', 'Gagal kirim simulasi: ' . $response->json('message', 'Unknown error'));
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

    /**
     * Endpoint untuk Semi-Bot WhatsApp.
     * Menerima invoice_code dan whatsapp_number, lalu kirim ulang key jika valid.
     */
    public function waBot(Request $request): \Illuminate\Http\JsonResponse
    {
        $secret = config('services.whatsapp.server_secret');
        $auth = $request->header('Authorization');

        if ($secret && $auth !== 'Bearer ' . $secret) {
            Log::warning('WebhookController@waBot: Unauthorized access attempt', ['ip' => $request->ip()]);

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $invoiceCode = strtoupper(trim($request->input('invoice_code')));
        $whatsappNumber = trim($request->input('whatsapp_number'));

        if (empty($invoiceCode) || empty($whatsappNumber)) {
            return response()->json(['message' => 'Format tidak valid.']);
        }

        $order = Order::where('invoice_code', $invoiceCode)->first();

        if (! $order) {
            return response()->json(['message' => "Pesanan dengan invoice *{$invoiceCode}* tidak ditemukan."]);
        }

        // Normalisasi nomor WA untuk perbandingan (menghilangkan prefix 62 atau 0)
        $cleanRequestNum = preg_replace('/^62|^0/', '', $whatsappNumber);
        $cleanOrderNum = preg_replace('/^62|^0/', '', $order->whatsapp_number);

        if ($cleanRequestNum !== $cleanOrderNum) {
            return response()->json([
                'message' => "Maaf, nomor WhatsApp Anda tidak sesuai dengan data pemesan untuk invoice *{$invoiceCode}*.",
            ]);
        }

        if ($order->status === OrderStatus::SUCCESS || $order->is_sent) {
            $this->whatsAppService->sendKeyDelivered($order);

            return response()->json([
                'message' => "✅ Key untuk invoice *{$invoiceCode}* telah dikirim ulang ke nomor ini. Silakan cek pesan di atas.",
            ]);
        }

        if ($order->status === OrderStatus::PAID) {
            // Jika sudah bayar tapi belum terkirim (mungkin antrian), coba proses sekarang
            try {
                $this->keyDeliveryService->deliver($order);

                return response()->json([
                    'message' => "⏳ Pembayaran terdeteksi. Key sedang diproses dan akan segera dikirim ke nomor ini.",
                ]);
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => "❌ Terjadi kesalahan saat memproses order *{$invoiceCode}*. Silakan hubungi admin.",
                ]);
            }
        }

        if ($order->status === OrderStatus::EXPIRED || $order->status === OrderStatus::FAILED) {
            return response()->json([
                'message' => "❌ Invoice *{$invoiceCode}* sudah kedaluwarsa atau gagal. Silakan lakukan pemesanan ulang.",
            ]);
        }

        return response()->json([
            'message' => "📋 Invoice *{$invoiceCode}* belum dibayar. Silakan selesaikan pembayaran terlebih dahulu.",
        ]);
    }
}
