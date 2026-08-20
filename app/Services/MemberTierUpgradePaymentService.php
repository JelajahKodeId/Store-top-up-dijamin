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
        protected \App\Services\Payment\PaymentGatewayInterface $paymentGateway,
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
            default => throw new \RuntimeException('Top up saldo belum didukung untuk gateway pembayaran ini. Silakan hubungi administrator.'),
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
            'payment_expired_at' => now()->addMinutes(20),
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
        $expiredTime = now()->addMinutes(20)->timestamp;
        $itemName = 'Upgrade '.$upgrade->targetTier->name;

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
                        'sku' => 'TIER_'.$upgrade->target_tier,
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
            'payment_url' => $data['pay_url'] ?? $data['checkout_url'] ?? null,
            'payment_expired_at' => isset($data['expired_time'])
                ? Carbon::createFromTimestamp($data['expired_time'], config('app.timezone'))
                : now()->addMinutes(20),
            'payload' => $data,
        ]);

        return ['payment_url' => $upgrade->payment_url];
    }



    /**
     * @return array<int, array{code: string, label: string, icon_url: ?string, fee: int|float, fee_pct: int|float}>
     */
    public function paymentChannelsForUi(): array
    {
        try {
            $channels = $this->paymentGateway->getPaymentChannels();

            $manualMethods = \App\Models\ManualPaymentMethod::where('is_active', true)->get()->map(function ($m) {
                return [
                    'code' => 'manual_' . $m->id,
                    'label' => $m->name,
                    'icon_url' => $m->image_url,
                ];
            })->toArray();

            return array_merge($channels, $manualMethods);
        } catch (\Throwable) {
            return [];
        }
    }

    public function defaultPaymentMethod(): string
    {
        $gateway = $this->paymentGateway->getGatewayName();

        return match ($gateway) {
            'tripay' => 'QRIS',
            default => 'MOCK_QRIS',
        };
    }
}
