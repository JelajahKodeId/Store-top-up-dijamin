<?php

namespace App\Enums;

enum OrderStatus: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case SUCCESS = 'success';
    case FAILED = 'failed';
    case CANCELED = 'canceled';

    public function label(): string
    {
        return match($this) {
            self::UNPAID => 'Menunggu Pembayaran',
            self::PAID => 'Sudah Dibayar',
            self::SUCCESS => 'Selesai',
            self::FAILED => 'Gagal',
            self::CANCELED => 'Dibatalkan',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::UNPAID => 'warning',
            self::PAID => 'info',
            self::SUCCESS => 'success',
            self::FAILED, self::CANCELED => 'danger',
        };
    }
}
