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
            'genspay' => $this->startGenspay($upgrade, $user, $paymentMethod),
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
    protected function startGenspay(MemberTierUpgrade $upgrade, User $user, string $paymentMethod): array
    {
        $apiKey = config('services.genspay.api_key', '');
        $baseUrl = 'https://genspay.my.id/api/v1';

        if ($apiKey === '') {
            throw new \RuntimeException('Konfigurasi Genspay belum lengkap.');
        }

        $amountInt = (int) $upgrade->amount;

        $response = Http::withHeaders([
                'X-API-Key' => $apiKey,
            ])
            ->timeout(15)
            ->post("{$baseUrl}/transaction/create", [
                'amount' => $amountInt,
                'order_id' => $upgrade->invoice_code,
                'payment_method' => $paymentMethod,
            ]);

        if (! $response->successful() || ! $response->json('success')) {
            $message = $response->json('error') ?? $response->json('message', 'Gagal membuat transaksi Genspay');
            Log::error("MemberTierUpgradePaymentService Genspay: {$message}", ['response' => $response->json()]);
            throw new \RuntimeException('Payment gateway error: '.$message);
        }

        $data = $response->json('data');

        $upgrade->update([
            'gateway' => 'genspay',
            'gateway_payment_reference' => $data['order_id'] ?? null,
            'payment_url' => $data['pay_url'] ?? null, // Genspay uses direct QR/Crypto, no checkout page
            'payment_expired_at' => isset($data['expiry_time'])
                ? Carbon::parse($data['expiry_time'])->setTimezone(config('app.timezone'))
                : now()->addMinutes(15),
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
            'genspay' => 'qris',
            default => 'MOCK_QRIS',
        };
    }
}
