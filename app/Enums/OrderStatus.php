<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Menunggu Pembayaran',
            self::PROCESSING => 'Sedang Diproses',
            self::COMPLETED => 'Selesai',
            self::FAILED => 'Gagal',
            self::REFUNDED => 'Dikembalikan',
        };
    }
}
