<?php

namespace App\Services\Payment;

use App\Models\Order;

/**
 * Mock payment service untuk development dan testing lokal.
 * Di production, ganti binding di AppServiceProvider ke TripayService.
 */
class MockPaymentService implements PaymentGatewayInterface
{
    public function createTransaction(Order $order, string $paymentMethod): array
    {
        $reference = 'MOCK-' . strtoupper($order->invoice_code);

        return [
            'reference_id' => $reference,
            'payment_url'  => url("/mock-payment/{$reference}"),
            'expired_at'   => now()->addHours(24),
            'payload'      => ['gateway' => 'mock', 'reference' => $reference],
        ];
    }

    public function validateWebhookSignature(string $rawBody, string $signature): bool
    {
        // Mode mock: bypass signature — selalu valid
        return true;
    }

    public function getGatewayName(): string
    {
        return 'mock';
    }

    public function getPaymentChannels(): array
    {
        return [
            ['code' => 'MOCK_QRIS', 'label' => 'QRIS (Mock)',  'icon_url' => null, 'fee' => 0, 'fee_pct' => 0],
            ['code' => 'MOCK_BANK', 'label' => 'Bank (Mock)',  'icon_url' => null, 'fee' => 0, 'fee_pct' => 0],
        ];
    }
}
