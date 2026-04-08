<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;

/**
 * Mock payment service untuk development dan testing lokal.
 */
class MockPaymentService implements PaymentGatewayInterface
{
    public function createTransaction(Order $order, string $paymentMethod): array
    {
        $reference = 'MOCK-'.strtoupper($order->invoice_code);

        return [
            'reference_id' => $reference,
            'payment_url' => url("/mock-payment/{$reference}"),
            'expired_at' => now()->addHours(24),
            'payload' => ['gateway' => 'mock', 'reference' => $reference],
        ];
    }

    public function verifyWebhook(Request $request): ?array
    {
        $headerSig = $request->header('X-Callback-Signature', '');

        if ($headerSig === 'wrong-signature') {
            return null;
        }

        $payload = json_decode($request->getContent(), true);
        if (! is_array($payload) || empty($payload)) {
            $payload = $request->all();
        }

        $referenceId = $payload['reference'] ?? $payload['reference_id'] ?? $payload['order_id'] ?? null;

        if (! $referenceId) {
            return null;
        }

        $rawStatus = strtolower((string) ($payload['status'] ?? $payload['transaction_status'] ?? ''));

        $status = match (true) {
            in_array($rawStatus, ['paid', 'success', 'settlement', 'capture'], true) => 'paid',
            in_array($rawStatus, ['failed', 'cancel', 'expired', 'deny', 'failure'], true) => 'failed',
            default => 'pending',
        };

        return [
            'reference_id' => (string) $referenceId,
            'status' => $status,
            'raw' => $payload,
        ];
    }

    public function getGatewayName(): string
    {
        return 'mock';
    }

    public function getPaymentChannels(): array
    {
        return [
            ['code' => 'MOCK_QRIS', 'label' => 'QRIS (Mock)', 'icon_url' => null, 'fee' => 0, 'fee_pct' => 0],
            ['code' => 'MOCK_BANK', 'label' => 'Bank (Mock)', 'icon_url' => null, 'fee' => 0, 'fee_pct' => 0],
        ];
    }
}
