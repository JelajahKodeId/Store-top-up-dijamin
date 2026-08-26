<?php

namespace App\Services\Payment;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenspayService implements PaymentGatewayInterface
{
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.genspay.api_key', '');
        $this->baseUrl = 'https://genspay.my.id/api/v1';
    }

    public function createTransaction(Order $order, string $paymentMethod): array
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('API Key Genspay belum dikonfigurasi.');
        }

        $baseAmount = (int) ceil($order->total_price);

        $response = Http::withHeaders([
            'X-API-Key' => $this->apiKey,
        ])
        ->timeout(15)
        ->post("{$this->baseUrl}/transaction/create", [
            'amount' => $baseAmount,
            'order_id' => $order->invoice_code,
            'payment_method' => $paymentMethod,
        ]);

        if (! $response->successful() || ! $response->json('success')) {
            $message = $response->json('error') ?? $response->json('message', 'Gagal membuat transaksi Genspay');
            Log::error("GenspayService: {$message}", ['response' => $response->json()]);
            throw new \RuntimeException("Payment gateway error: {$message}");
        }

        $data = $response->json('data');

        return [
            'reference_id' => $data['order_id'],
            'payment_url' => null, // Genspay uses direct qr_string or pay_address, no checkout page
            'expired_at' => isset($data['expiry_time']) ? Carbon::parse($data['expiry_time'])->setTimezone(config('app.timezone')) : now()->addMinutes(15),
            'payload' => $data,
        ];
    }

    public function verifyWebhook(Request $request): ?array
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-GensPay-Signature') ?? '';

        $localSignature = hash('sha256', $rawBody . $this->apiKey);

        if (! hash_equals($localSignature, $signature)) {
            return null;
        }

        $payload = json_decode($rawBody, true) ?? [];
        $data = $payload['data'] ?? [];
        $orderId = $data['order_id'] ?? null;

        if (! $orderId) {
            return null;
        }

        $rawStatus = strtoupper((string) ($data['status'] ?? ''));
        $status = match (true) {
            $rawStatus === 'SUCCESS' => 'paid',
            in_array($rawStatus, ['FAILED', 'EXPIRED'], true) => 'failed',
            default => 'pending',
        };

        return [
            'reference_id' => (string) $orderId,
            'status' => $status,
            'raw' => $data,
        ];
    }

    public function getGatewayName(): string
    {
        return 'genspay';
    }

    public function getPaymentChannels(): array
    {
        return [
            [
                'code' => 'qris',
                'label' => 'QRIS',
                'icon_url' => null,
                'fee' => 0,
                'fee_pct' => 0,
            ],
            [
                'code' => 'usdt_bsc',
                'label' => 'USDT (BSC/BEP20)',
                'icon_url' => null,
                'fee' => 0,
                'fee_pct' => 0,
            ],
        ];
    }
}
