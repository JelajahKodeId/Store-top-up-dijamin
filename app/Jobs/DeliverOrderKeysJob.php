<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\KeyDeliveryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DeliverOrderKeysJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /** Maksimal percobaan ulang jika job gagal */
    public int $tries = 3;

    /** Jeda antar percobaan (detik) */
    public int $backoff = 10;

    /** Timeout eksekusi job (detik) */
    public int $timeout = 60;

    public function __construct(public readonly Order $order) {}

    public function handle(KeyDeliveryService $keyDeliveryService): void
    {
        Log::info("DeliverOrderKeysJob: Memproses order #{$this->order->invoice_code}");

        $freshOrder = Order::find($this->order->id);

        if (! $freshOrder) {
            Log::error("DeliverOrderKeysJob: Order #{$this->order->invoice_code} tidak ditemukan.");
            return;
        }

        $keyDeliveryService->deliver($freshOrder);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error(
            "DeliverOrderKeysJob: Gagal total setelah {$this->tries}x percobaan untuk order #{$this->order->invoice_code} — {$exception->getMessage()}"
        );
    }
}
