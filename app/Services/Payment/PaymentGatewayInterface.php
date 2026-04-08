<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Buat transaksi pembayaran baru di gateway.
     * Mengembalikan array berisi: reference_id, payment_url, expired_at, payload.
     */
    public function createTransaction(Order $order, string $paymentMethod): array;

    /**
     * Validasi webhook/notifikasi dari gateway dan normalisasi status.
     * Tripay: JSON + header X-Callback-Signature (HMAC raw body).
     * Midtrans: form/json + signature_key SHA512(order_id + status_code + gross_amount + server_key).
     *
     * @return array{reference_id: string, status: string, raw: array}|null null jika signature tidak valid
     */
    public function verifyWebhook(Request $request): ?array;

    public function getGatewayName(): string;

    /**
     * @return array<int, array{code: string, label: string, icon_url: ?string, fee: int|float, fee_pct: int|float}>
     */
    public function getPaymentChannels(): array;
}
