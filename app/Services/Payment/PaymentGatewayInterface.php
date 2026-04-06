<?php

namespace App\Services\Payment;

use App\Models\Order;

interface PaymentGatewayInterface
{
    /**
     * Buat transaksi pembayaran baru di gateway.
     * Mengembalikan array berisi: reference_id, payment_url, expired_at, payload.
     */
    public function createTransaction(Order $order, string $paymentMethod): array;

    /**
     * Validasi signature dari webhook yang masuk.
     * $rawBody adalah raw request body (string JSON mentah — JANGAN decode terlebih dahulu).
     * Tripay menghitung signature dari raw body, bukan dari array yang di-re-encode.
     */
    public function validateWebhookSignature(string $rawBody, string $signature): bool;

    /**
     * Dapatkan nama gateway ini (tripay, midtrans, mock, dll).
     */
    public function getGatewayName(): string;

    /**
     * Ambil daftar channel pembayaran yang tersedia dari gateway.
     * Return: array of ['code' => ..., 'label' => ..., 'icon_url' => ...]
     */
    public function getPaymentChannels(): array;
}
