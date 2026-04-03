<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OrderNotificationService;

class OrderObserver
{
    public function __construct(
        protected OrderNotificationService $notificationService
    ) {}

    /**
     * Kirim email saat order baru dibuat (status: unpaid).
     */
    public function created(Order $order): void
    {
        $this->notificationService->sendForStatus($order);
    }

    /**
     * Kirim email saat status order berubah.
     */
    public function updated(Order $order): void
    {
        // Hanya kirim email jika status yang benar-benar berubah
        if ($order->wasChanged('status')) {
            $this->notificationService->sendForStatus($order);
        }
    }
}
