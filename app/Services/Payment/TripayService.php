<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TripayService — integrasi dengan Payment Gateway Tripay.
 * Konfigurasi via environment:
 *   TRIPAY_API_KEY=
 *   TRIPAY_PRIVATE_KEY=
 *   TRIPAY_MERCHANT_CODE=
 *   TRIPAY_MODE=sandbox|production
 */
class TripayService implements PaymentGatewayInterface
{
    protected string $apiKey;
    protected string $privateKey;
    protected string $merchantCode;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey       = config('services.tripay.api_key', '');
        $this->privateKey   = config('services.tripay.private_key', '');
        $this->merchantCode = config('services.tripay.merchant_code', '');
        $this->baseUrl      = config('services.tripay.mode', 'sandbox') === 'production'
            ? 'https://tripay.co.id/api'
            : 'https://tripay.co.id/api-sandbox';
    }

    public function createTransaction(Order $order, string $paymentMethod): array
    {
        $signature = hash_hmac('sha256', $this->merchantCode . $order->invoice_code . (int) $order->total_price, $this->privateKey);

        $expiredTime = now()->addHours(24)->timestamp;

        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/transaction/create", [
                'method'         => $paymentMethod,
                'merchant_ref'   => $order->invoice_code,
                'amount'         => (int) $order->total_price,
                'customer_name'  => $order->customer_name ?? 'Customer',
                'customer_email' => $order->customer_email ?? 'noreply@store.local',
                'customer_phone' => $order->whatsapp_number ?? '',
                'order_items'    => $order->items->map(fn($item) => [
                    'sku'        => (string) $item->id,
                    'name'       => "{$item->product_name} ({$item->duration_name})",
                    'price'      => (int) $item->price,
                    'quantity'   => $item->quantity,
                ])->toArray(),
                'callback_url'   => route('webhooks.payment'),
                'return_url'     => route('orders.status', $order->invoice_code),
                'signature'      => $signature,
                'expired_time'   => $expiredTime,
            ]);

        if (! $response->successful() || ! $response->json('success')) {
            $message = $response->json('message', 'Gagal membuat transaksi Tripay');
            Log::error("TripayService: {$message}", ['response' => $response->json()]);
            throw new \RuntimeException("Payment gateway error: {$message}");
        }

        $data = $response->json('data');

        return [
            'reference_id' => $data['reference'],
            'payment_url'  => $data['checkout_url'] ?? null,
            'expired_at'   => isset($data['expired_time']) ? \Carbon\Carbon::createFromTimestamp($data['expired_time']) : now()->addHours(24),
            'payload'      => $data,
        ];
    }

    public function validateWebhookSignature(string $rawBody, string $signature): bool
    {
        $localSignature = hash_hmac('sha256', $rawBody, $this->privateKey);

        return hash_equals($localSignature, $signature);
    }

    public function getGatewayName(): string
    {
        return 'tripay';
    }

    /**
     * Ambil daftar channel pembayaran dari Tripay (di-cache 1 jam).
     * Jika gagal (API error / tidak dikonfigurasi), return channel fallback.
     */
    public function getPaymentChannels(): array
    {
        if (empty($this->apiKey)) {
            return $this->getFallbackChannels();
        }

        return Cache::remember('tripay_payment_channels', 3600, function () {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(8)
                    ->get("{$this->baseUrl}/merchant/payment-channel");

                if (! $response->successful() || ! $response->json('success')) {
                    Log::warning('TripayService: Gagal ambil payment channels — ' . $response->body());
                    return $this->getFallbackChannels();
                }

                $channels = $response->json('data', []);

                if (empty($channels)) {
                    return $this->getFallbackChannels();
                }

                return collect($channels)
                    ->where('active', true)
                    ->map(fn($ch) => [
                        'code'     => $ch['code'],
                        'label'    => $ch['name'],
                        'icon_url' => $ch['icon_url'] ?? null,
                        'fee'      => $ch['total_fee']['flat'] ?? 0,
                        'fee_pct'  => $ch['total_fee']['percent'] ?? 0,
                    ])
                    ->values()
                    ->toArray();
            } catch (\Throwable $e) {
                Log::error('TripayService: Exception getPaymentChannels — ' . $e->getMessage());
                return $this->getFallbackChannels();
            }
        });
    }

    /**
     * Channel fallback jika API Tripay tidak dapat dijangkau.
     * Kode sesuai dokumentasi resmi Tripay.
     */
    protected function getFallbackChannels(): array
    {
        return [
            ['code' => 'QRIS',       'label' => 'QRIS',         'icon_url' => null, 'fee' => 0, 'fee_pct' => 0.7],
            ['code' => 'BCAVA',      'label' => 'BCA Virtual Account',     'icon_url' => null, 'fee' => 4000, 'fee_pct' => 0],
            ['code' => 'BNIVA',      'label' => 'BNI Virtual Account',     'icon_url' => null, 'fee' => 4000, 'fee_pct' => 0],
            ['code' => 'BRIVA',      'label' => 'BRI Virtual Account',     'icon_url' => null, 'fee' => 4000, 'fee_pct' => 0],
            ['code' => 'MANDIRIVA',  'label' => 'Mandiri Virtual Account', 'icon_url' => null, 'fee' => 4000, 'fee_pct' => 0],
            ['code' => 'PERMATAVA',  'label' => 'Permata Virtual Account', 'icon_url' => null, 'fee' => 4000, 'fee_pct' => 0],
            ['code' => 'OVO',        'label' => 'OVO',          'icon_url' => null, 'fee' => 0, 'fee_pct' => 2.0],
            ['code' => 'DANA',       'label' => 'DANA',         'icon_url' => null, 'fee' => 0, 'fee_pct' => 2.0],
            ['code' => 'SHOPEEPAY',  'label' => 'ShopeePay',    'icon_url' => null, 'fee' => 0, 'fee_pct' => 2.0],
        ];
    }
}
