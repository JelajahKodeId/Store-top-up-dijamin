<?php

namespace App\Services;

use App\Models\MemberTierUpgrade;
use App\Models\User;
use App\Services\Payment\PaymentGatewayInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MemberTierUpgradePaymentService
{
    public function __construct(
        protected PaymentGatewayInterface $paymentGateway,
    ) {}

    /**
     * @return array{payment_url: ?string}
     */
    public function startGatewaySession(MemberTierUpgrade $upgrade, User $user, string $paymentMethod): array
    {
        $driver = $this->paymentGateway->getGatewayName();

        return match ($driver) {
            'mock' => $this->startMock($upgrade),
            'tripay' => $this->startTripay($upgrade, $user, $paymentMethod),
            'pak_kasir' => $this->startPakKasir($upgrade, $paymentMethod),
            default => throw new \RuntimeException('Upgrade paket belum didukung untuk gateway pembayaran ini. Silakan hubungi administrator.'),
        };
    }

    /**
     * @return array{payment_url: ?string}
     */
    protected function startMock(MemberTierUpgrade $upgrade): array
    {
        $ref = 'MOCK-'.$upgrade->invoice_code;
        $upgrade->update([
            'gateway' => 'mock',
            'gateway_payment_reference' => $ref,
            'payment_url' => url('/mock-payment/'.$ref),
            'payment_expired_at' => now()->addHours(24),
            'payload' => ['gateway' => 'mock', 'reference' => $ref],
        ]);

        return ['payment_url' => $upgrade->payment_url];
    }

    /**
     * @return array{payment_url: ?string}
     */
    protected function startTripay(MemberTierUpgrade $upgrade, User $user, string $paymentMethod): array
    {
        $apiKey = config('services.tripay.api_key', '');
        $privateKey = config('services.tripay.private_key', '');
        $merchantCode = config('services.tripay.merchant_code', '');
        $baseUrl = config('services.tripay.mode', 'sandbox') === 'production'
            ? 'https://tripay.co.id/api'
            : 'https://tripay.co.id/api-sandbox';

        if ($apiKey === '' || $privateKey === '' || $merchantCode === '') {
            throw new \RuntimeException('Konfigurasi Tripay belum lengkap.');
        }

        $amountInt = (int) $upgrade->amount;
        $signature = hash_hmac('sha256', $merchantCode.$upgrade->invoice_code.$amountInt, $privateKey);
        $expiredTime = now()->addHours(24)->timestamp;
        $itemName = 'Upgrade '.$upgrade->target_tier->label();

        $response = Http::withToken($apiKey)
            ->post("{$baseUrl}/transaction/create", [
                'method' => $paymentMethod,
                'merchant_ref' => $upgrade->invoice_code,
                'amount' => $amountInt,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $user->phone_number ?? '',
                'order_items' => [
                    [
                        'sku' => 'TIER_'.$upgrade->target_tier->value,
                        'name' => $itemName,
                        'price' => $amountInt,
                        'quantity' => 1,
                    ],
                ],
                'callback_url' => route('webhooks.payment'),
                'return_url' => route('member.packages.show', $upgrade->invoice_code),
                'signature' => $signature,
                'expired_time' => $expiredTime,
            ]);

        if (! $response->successful() || ! $response->json('success')) {
            $message = $response->json('message', 'Gagal membuat transaksi Tripay');
            Log::error("MemberTierUpgradePaymentService Tripay: {$message}", ['response' => $response->json()]);

            throw new \RuntimeException('Payment gateway error: '.$message);
        }

        $data = $response->json('data');

        $upgrade->update([
            'gateway' => 'tripay',
            'gateway_payment_reference' => $data['reference'] ?? null,
            'payment_url' => $data['checkout_url'] ?? null,
            'payment_expired_at' => isset($data['expired_time'])
                ? Carbon::createFromTimestamp($data['expired_time'])
                : now()->addHours(24),
            'payload' => $data,
        ]);

        return ['payment_url' => $upgrade->payment_url];
    }

    /**
     * @return array{payment_url: ?string}
     */
    protected function startPakKasir(MemberTierUpgrade $upgrade, string $paymentMethod): array
    {
        $apiKey = (string) config('services.pak_kasir.api_key', '');
        $slug = (string) config('services.pak_kasir.slug', '');

        if ($apiKey === '' || $slug === '') {
            throw new \RuntimeException('Konfigurasi Pak Kasir belum lengkap.');
        }

        $orderId = $upgrade->invoice_code;
        $amount = (int) round((float) $upgrade->amount);
        $redirectUrl = route('member.packages.show', $upgrade->invoice_code);

        if (in_array(strtolower($paymentMethod), ['pak_kasir_all', 'universal', 'checkout_page'], true)) {
            $paymentUrl = "https://app.pakasir.com/pay/{$slug}/{$amount}?order_id={$orderId}&redirect=".urlencode($redirectUrl);
            $upgrade->update([
                'gateway' => 'pak_kasir',
                'gateway_payment_reference' => $orderId,
                'payment_url' => $paymentUrl,
                'payment_expired_at' => now()->addHours(24),
                'payload' => ['mode' => 'universal_url'],
            ]);

            return ['payment_url' => $paymentUrl];
        }

        $baseUrl = 'https://app.pakasir.com/api';
        $method = $this->normalizePakKasirMethod($paymentMethod);

        $payload = [
            'project' => $slug,
            'order_id' => $orderId,
            'amount' => $amount,
            'api_key' => $apiKey,
        ];

        $response = Http::asJson()
            ->timeout(30)
            ->post("{$baseUrl}/transactioncreate/{$method}", $payload);

        if (! $response->successful()) {
            Log::error('MemberTierUpgradePaymentService PakKasir: create failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Payment gateway error: '.$response->json('message', 'Gagal membuat transaksi Pak Kasir'));
        }

        $data = $response->json();
        $paymentUrl = $data['payment_url'] ?? $data['checkout_url'] ?? null;

        $upgrade->update([
            'gateway' => 'pak_kasir',
            'gateway_payment_reference' => $orderId,
            'payment_url' => $paymentUrl,
            'payment_expired_at' => now()->addHours(24),
            'payload' => $data,
        ]);

        return ['payment_url' => $paymentUrl];
    }

    protected function normalizePakKasirMethod(string $method): string
    {
        $map = [
            'QRIS' => 'qris',
            'BNI' => 'bni_va',
            'BNI_VA' => 'bni_va',
            'BRI' => 'bri_va',
            'BRI_VA' => 'bri_va',
            'MANDIRI' => 'mandiri_va',
            'MANDIRI_VA' => 'mandiri_va',
            'PERMATA' => 'permata_va',
            'PERMATA_VA' => 'permata_va',
            'CIMB' => 'cimb_niaga_va',
            'CIMB_VA' => 'cimb_niaga_va',
            'RETAIL' => 'retail',
        ];

        return $map[strtoupper($method)] ?? strtolower($method);
    }

    /**
     * @return array<int, array{code: string, label: string, icon_url: ?string, fee: int|float, fee_pct: int|float}>
     */
    public function paymentChannelsForUi(): array
    {
        try {
            return $this->paymentGateway->getPaymentChannels();
        } catch (\Throwable) {
            return [];
        }
    }

    public function defaultPaymentMethod(): string
    {
        $gateway = $this->paymentGateway->getGatewayName();

        return match ($gateway) {
            'tripay' => 'QRIS',
            'midtrans' => 'midtrans_snap',
            'pak_kasir' => 'qris',
            default => 'MOCK_QRIS',
        };
    }
}
