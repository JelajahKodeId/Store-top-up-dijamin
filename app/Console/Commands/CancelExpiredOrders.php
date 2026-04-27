<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Enums\OrderStatus;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membatalkan pesanan yang belum dibayar setelah melewati batas waktu (10 menit)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredOrders = Order::where('status', OrderStatus::UNPAID)
            ->whereNotNull('payment_expired_at')
            ->where('payment_expired_at', '<', now())
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('Tidak ada pesanan yang kadaluarsa saat ini.');
            return;
        }

        $count = 0;
        foreach ($expiredOrders as $order) {
            $order->update(['status' => OrderStatus::FAILED]);
            $this->info("Order #{$order->invoice_code} telah dibatalkan (Expired).");
            Log::info("Order #{$order->invoice_code} cancelled via task scheduler (Expired).");
            $count++;
        }

        $this->info("Berhasil memproses {$count} pesanan.");
    }
}
