<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case EXPIRED = 'expired';
    case FAILED = 'failed';

    public function label(): string
    {
        return match($this) {
            self::UNPAID => 'Belum Dibayar',
            self::PAID => 'Sudah Dibayar',
            self::EXPIRED => 'Kadaluarsa',
            self::FAILED => 'Gagal',
        };
    }
}
