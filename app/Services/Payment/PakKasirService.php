<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * PakKasirService — Integrasi dengan Payment Gateway Pak Kasir.
 * 
 * Dokumentasi: https://pakasir.com/p/docs
 */
class PakKasirService implements PaymentGatewayInterface
{
    protected string $apiKey;
    protected string $slug;
    protected string $mode;
    protected string $baseUrl = 'https://app.pakasir.com/api';

    public function __construct()
    {
        $this->apiKey = (string) config('services.pak_kasir.api_key', '');
        $this->slug   = (string) config('services.pak_kasir.slug', '');
        $this->mode   = (string) config('services.pak_kasir.mode', 'sandbox');
    }

    public function createTransaction(Order $order, string $paymentMethod): array
    {
        if ($this->apiKey === '' || $this->slug === '') {
            throw new \RuntimeException('PAK_KASIR_API_KEY atau PAK_KASIR_SLUG belum diatur di .env');
        }

        $orderId = $order->invoice_code;
        $amount  = (int) round((float) $order->total_price);
        $redirectUrl = route('orders.status', $orderId);

        // Jika method adalah 'pak_kasir_all' atau 'universal', gunakan URL Checkout (Gaya Midtrans Snap)
        if (in_array(strtolower($paymentMethod), ['pak_kasir_all', 'universal', 'checkout_page'])) {
            $paymentUrl = "https://app.pakasir.com/pay/{$this->slug}/{$amount}?order_id={$orderId}&redirect=" . urlencode($redirectUrl);
            
            return [
                'reference_id' => $orderId,
                'payment_url'  => $paymentUrl,
                'expired_at'   => now()->addHours(24),
                'payload'      => ['mode' => 'universal_url'],
            ];
        }

        // Pak Kasir transactioncreate/{method}
        $method = $this->normalizeMethod($paymentMethod);

        $payload = [
            'project'  => $this->slug,
            'order_id' => $orderId,
            'amount'   => $amount,
            'api_key'  => $this->apiKey,
        ];

        $response = Http::asJson()
            ->timeout(30)
            ->post("{$this->baseUrl}/transactioncreate/{$method}", $payload);

        if (!$response->successful()) {
            Log::error('PakKasirService: create transaction failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'method' => $method
            ]);
            throw new \RuntimeException('Payment gateway error: ' . $response->json('message', 'Gagal membuat transaksi Pak Kasir'));
        }

        $data = $response->json();
        $paymentUrl = $data['payment_url'] ?? $data['checkout_url'] ?? null;

        return [
            'reference_id' => $orderId,
            'payment_url'  => $paymentUrl,
            'expired_at'   => now()->addHours(24),
            'payload'      => $data,
        ];
    }

    public function verifyWebhook(Request $request): ?array
    {
        $data = $request->json()->all();
        $orderId = $data['order_id'] ?? null;
        $amount = $data['amount'] ?? null;
        $slug = $data['project'] ?? null;

        if (!$orderId || !$amount || (isset($slug) && $slug !== $this->slug)) {
            Log::warning('PakKasirService: Webhook invalid payload', ['payload' => $data]);
            return null;
        }

        // Pak Kasir tidak memiliki signature HMAC. Sangat disarankan untuk memverifikasi ulang ke API.
        return $this->verifyViaApi($orderId, $amount, $data);
    }

    /**
     * Memverifikasi status transaksi langsung ke API Pak Kasir (Authoritative).
     */
    protected function verifyViaApi(string $orderId, $amount, array $originalPayload): ?array
    {
        $response = Http::timeout(15)->get("{$this->baseUrl}/transactiondetail", [
            'project'  => $this->slug,
            'order_id' => $orderId,
            'amount'   => $amount,
            'api_key'  => $this->apiKey,
        ]);

        if (!$response->successful()) {
            Log::error('PakKasirService: verifyViaApi failed', ['order_id' => $orderId, 'body' => $response->body()]);
            
            // Jika transaksi belum ada di Pak Kasir (404), tetap return null agar tidak mengubah status order
            return null;
        }

        $data = $response->json();
        // Pak Kasir API mengembalikan status di dalam transaction.status
        $rawStatus = strtolower((string) ($data['transaction']['status'] ?? $data['status'] ?? ''));

        // Pemetaan status: Pak Kasir 'completed' => 'paid'
        $status = match ($rawStatus) {
            'completed', 'paid', 'success' => 'paid',
            'pending', 'unpaid' => 'pending',
            'expired', 'failed', 'canceled' => 'failed',
            default => 'pending',
        };

        return [
            'reference_id' => $orderId,
            'status'       => $status,
            'raw'          => array_merge($originalPayload, ['api_verification' => $data]),
        ];
    }

    public function getGatewayName(): string
    {
        return 'pak_kasir';
    }

    public function getPaymentChannels(): array
    {
        return [
            [
                'code'     => 'qris',
                'label'    => 'QRIS (All Payment)',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'bni_va',
                'label'    => 'BNI Virtual Account',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'bri_va',
                'label'    => 'BRI Virtual Account',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'mandiri_va',
                'label'    => 'Mandiri Virtual Account',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'permata_va',
                'label'    => 'Permata Virtual Account',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'cimb_niaga_va',
                'label'    => 'CIMB Niaga Virtual Account',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'retail',
                'label'    => 'Alfamart / Indomaret',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
            [
                'code'     => 'pak_kasir_all',
                'label'    => 'Metode Lainnya (Halaman Pak Kasir)',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
        ];
    }

    protected function normalizeMethod(string $method): string
    {
        // Peta kan kode internal ke kode yang dimengerti Pak Kasir
        $map = [
            'QRIS' => 'qris',
            'BNI'  => 'bni_va',
            'BNI_VA' => 'bni_va',
            'BRI'  => 'bri_va',
            'BRI_VA' => 'bri_va',
            'MANDIRI' => 'mandiri_va',
            'MANDIRI_VA' => 'mandiri_va',
            'PERMATA' => 'permata_va',
            'PERMATA_VA' => 'permata_va',
            'CIMB' => 'cimb_niaga_va',
            'CIMB_VA' => 'cimb_niaga_va',
            'RETAIL'  => 'retail',
        ];

        return $map[strtoupper($method)] ?? strtolower($method);
    }
}
