<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Midtrans — Snap + HTTP notification.
 *
 * @see https://docs.midtrans.com/
 *
 * Env:
 *   MIDTRANS_SERVER_KEY=
 *   MIDTRANS_CLIENT_KEY=
 *   MIDTRANS_IS_PRODUCTION=false
 *   MIDTRANS_ALLOW_PRODUCTION_IN_LOCAL=false
 */
class MidtransService implements PaymentGatewayInterface
{
    protected string $serverKey;

    protected string $clientKey;

    protected bool $isProduction;

    protected string $apiBase;

    public function __construct()
    {
        $this->serverKey   = (string) config('services.midtrans.server_key', '');
        $this->clientKey   = (string) config('services.midtrans.client_key', '');
        $this->isProduction = filter_var(config('services.midtrans.is_production', false), FILTER_VALIDATE_BOOLEAN);
        $this->apiBase     = $this->isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    public function createTransaction(Order $order, string $paymentMethod): array
    {
        if ($this->serverKey === '') {
            throw new \RuntimeException('MIDTRANS_SERVER_KEY belum diatur di .env');
        }

        $this->assertMidtransEnvironment();

        $order->loadMissing('items');

        $orderId = $order->invoice_code;
        $gross   = (int) round((float) $order->total_price);

        if ($gross < 1) {
            throw new \RuntimeException('Total pembayaran tidak valid untuk Midtrans.');
        }

        $itemDetails = [];
        foreach ($order->items as $item) {
            $itemDetails[] = [
                'id'       => 'item-'.$item->id,
                'price'    => (int) round((float) $item->price),
                'quantity' => (int) $item->quantity,
                'name'     => mb_substr($item->product_name.' ('.$item->duration_name.')', 0, 50),
            ];
        }

        if (empty($itemDetails)) {
            $itemDetails[] = [
                'id'       => 'order-'.$order->id,
                'price'    => $gross,
                'quantity' => 1,
                'name'     => 'Pembelian #'.$orderId,
            ];
        }

        $itemSum = 0;
        foreach ($itemDetails as $row) {
            $itemSum += (int) $row['price'] * (int) $row['quantity'];
        }

        if ($itemSum !== $gross) {
            $itemDetails = [[
                'id'       => 'order-'.$order->id,
                'price'    => $gross,
                'quantity' => 1,
                'name'     => 'Pembelian #'.$orderId,
            ]];
        }

        $finishUrl = route('orders.status', $order->invoice_code, true);
        $notifyUrl = route('webhooks.payment', [], true);

        $payload = [
            'transaction_details' => [
                'order_id'       => $orderId,
                'gross_amount'   => $gross,
            ],
            'item_details'        => $itemDetails,
            'customer_details'    => [
                'first_name' => mb_substr($order->customer_name ?: 'Customer', 0, 50),
                'phone'      => preg_replace('/\D/', '', (string) ($order->whatsapp_number ?? '')) ?: '081000000000',
                'email'      => $order->customer_email ?: ('guest@'.(parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'store.local')),
            ],
            'callbacks'           => [
                'finish' => $finishUrl,
            ],
            'notification_url'    => $notifyUrl,
            'expiry'              => [
                'unit'     => 'hours',
                'duration' => 24,
            ],
        ];

        $response = Http::withBasicAuth($this->serverKey, '')
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->post("{$this->apiBase}/v1/transactions", $payload);

        if (! $response->successful()) {
            $message = $response->json('error_messages.0', $response->json('status_message', 'Gagal membuat transaksi Midtrans'));
            Log::error('MidtransService: create transaction failed', ['body' => $response->body()]);
            throw new \RuntimeException('Payment gateway error: '.$message);
        }

        $data = $response->json();
        $token = $data['token'] ?? null;

        if (! $token) {
            Log::error('MidtransService: no snap token in response', ['data' => $data]);
            throw new \RuntimeException('Payment gateway error: respons Midtrans tidak berisi token Snap.');
        }

        $redirectUrl = $data['redirect_url'] ?? null;

        return [
            'reference_id' => $orderId,
            'payment_url'  => $redirectUrl,
            'expired_at'   => now()->addHours(24),
            'payload'      => array_merge($data, [
                'snap_token'         => $token,
                'midtrans_client_key'=> $this->clientKey,
                'midtrans_production'=> $this->isProduction,
            ]),
        ];
    }

    public function verifyWebhook(Request $request): ?array
    {
        if ($this->serverKey === '') {
            return null;
        }

        try {
            $this->assertMidtransEnvironment();
        } catch (\RuntimeException $e) {
            Log::error('MidtransService: konfigurasi tidak aman — '.$e->getMessage());

            return null;
        }

        $data = $this->extractNotificationPayload($request);

        $orderId = $data['order_id'] ?? null;
        $statusCode = (string) ($data['status_code'] ?? '');
        $grossAmount = (string) ($data['gross_amount'] ?? '');
        $signatureKey = $data['signature_key'] ?? '';

        if (! $orderId || $signatureKey === '') {
            Log::warning('MidtransService: notifikasi tanpa order_id atau signature_key');

            return null;
        }

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        if (! hash_equals($expected, $signatureKey)) {
            Log::warning('MidtransService: signature_key tidak cocok');

            return null;
        }

        $txStatus = strtolower((string) ($data['transaction_status'] ?? ''));

        $status = match ($txStatus) {
            'settlement', 'capture' => 'paid',
            'pending' => 'pending',
            'expire' => 'expired',
            'cancel', 'deny', 'failure' => 'failed',
            default => 'unknown',
        };

        if ($status === 'unknown') {
            Log::info('MidtransService: transaction_status tidak dipetakan — '.$txStatus);

            return [
                'reference_id' => (string) $orderId,
                'status'       => 'pending',
                'raw'          => $data,
            ];
        }

        return [
            'reference_id' => (string) $orderId,
            'status'       => $status,
            'raw'          => $data,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function extractNotificationPayload(Request $request): array
    {
        $contentType = (string) $request->header('Content-Type', '');

        if (str_contains($contentType, 'application/json')) {
            $decoded = json_decode($request->getContent(), true);

            return is_array($decoded) ? $decoded : [];
        }

        return $request->all();
    }

    public function getGatewayName(): string
    {
        return 'midtrans';
    }

    /**
     * Cegah production API dari mesin lokal tanpa sengaja; pastikan prefix kunci cocok dengan mode.
     */
    protected function assertMidtransEnvironment(): void
    {
        if (app()->environment('local') && $this->isProduction
            && ! filter_var(config('services.midtrans.allow_production_in_local'), FILTER_VALIDATE_BOOLEAN)) {
            throw new \RuntimeException(
                'Midtrans production dinonaktifkan saat APP_ENV=local. Set MIDTRANS_ALLOW_PRODUCTION_IN_LOCAL=true hanya jika disengaja, atau pakai sandbox.'
            );
        }

        $isSandboxServerKey = str_starts_with($this->serverKey, 'SB-Mid-server-');
        $isProdServerKey    = str_starts_with($this->serverKey, 'Mid-server-');

        if (! $this->isProduction && $isProdServerKey) {
            throw new \RuntimeException(
                'Server key production terdeteksi sementara MIDTRANS_IS_PRODUCTION=false. Pakai kunci sandbox (SB-Mid-server-...).'
            );
        }

        if ($this->isProduction && $isSandboxServerKey) {
            throw new \RuntimeException(
                'Server key sandbox terdeteksi sementara MIDTRANS_IS_PRODUCTION=true. Pakai kunci production (Mid-server-...).'
            );
        }

        if (! $isSandboxServerKey && ! $isProdServerKey && $this->serverKey !== '') {
            Log::warning('MidtransService: format MIDTRANS_SERVER_KEY tidak dikenali; pastikan dari dashboard Midtrans.');
        }

        $ck = $this->clientKey;
        if ($ck !== '') {
            $ckSandbox = str_starts_with($ck, 'SB-Mid-client-');
            $ckProd    = str_starts_with($ck, 'Mid-client-');
            if (! $this->isProduction && $ckProd && ! $ckSandbox) {
                throw new \RuntimeException(
                    'Client key production terdeteksi sementara MIDTRANS_IS_PRODUCTION=false. Pakai kunci sandbox (SB-Mid-client-...).'
                );
            }
            if ($this->isProduction && $ckSandbox && ! $ckProd) {
                throw new \RuntimeException(
                    'Client key sandbox terdeteksi sementara MIDTRANS_IS_PRODUCTION=true. Pakai kunci production (Mid-client-...).'
                );
            }
        }
    }

    public function getPaymentChannels(): array
    {
        return [
            [
                'code'     => 'midtrans_snap',
                'label'    => 'Midtrans — QRIS, VA, Kartu, E-Wallet',
                'icon_url' => null,
                'fee'      => 0,
                'fee_pct'  => 0,
            ],
        ];
    }
}
