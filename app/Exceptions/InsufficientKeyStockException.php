<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientKeyStockException extends RuntimeException
{
    public function __construct(string $productName, string $durationName)
    {
        parent::__construct(
            "Stok key habis untuk produk '{$productName}' varian '{$durationName}'. Pesanan tidak dapat diselesaikan otomatis."
        );
    }
}
