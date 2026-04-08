<?php

namespace App\Support;

/**
 * Label tampilan konsisten untuk metode / gateway pembayaran (guest & admin).
 */
class PaymentLabels
{
    public static function methodLabel(?string $methodCode, ?string $paymentGateway): string
    {
        $code = $methodCode ?? '';
        $gw = $paymentGateway ?? '';

        if ($code === '' && $gw === '') {
            return '';
        }

        if ($gw === 'midtrans' || $code === 'midtrans_snap') {
            return 'Midtrans (Snap — QRIS, VA, E-Wallet)';
        }

        if ($gw === 'mock' || ($code !== '' && str_starts_with($code, 'MOCK_'))) {
            return match ($code) {
                'MOCK_BANK' => 'Simulasi pembayaran (Bank, lokal)',
                default => 'Simulasi pembayaran (QRIS, lokal)',
            };
        }

        if ($gw === 'tripay' && $code !== '') {
            return strtoupper($code).' (Tripay)';
        }

        if ($code !== '') {
            return $code;
        }

        if ($gw !== '') {
            return ucfirst($gw);
        }

        return '';
    }
}
