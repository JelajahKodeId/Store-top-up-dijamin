<?php

namespace App\Services;

use App\Mail\OrderCreatedMail;
use App\Mail\OrderFailedMail;
use App\Mail\OrderPaidMail;
use App\Mail\OrderSuccessMail;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    /**
     * Kirim email notifikasi sesuai status order saat ini.
     */
    public function sendForStatus(Order $order): void
    {
        if (! $order->hasEmailRecipient()) {
            Log::info("OrderNotification: Order #{$order->trx_id} tidak memiliki email tujuan, dilewati.");
            return;
        }

        $email = $order->getCustomerEmail();
        $mailable = match ($order->status) {
            'unpaid'   => new OrderCreatedMail($order),
            'paid'     => new OrderPaidMail($order),
            'success'  => new OrderSuccessMail($order),
            'failed', 'canceled' => new OrderFailedMail($order),
            default    => null,
        };

        if ($mailable === null) {
            return;
        }

        try {
            Mail::to($email)->queue($mailable);
            Log::info("OrderNotification: Email '{$order->status}' dikirim ke {$email} untuk order #{$order->trx_id}");
        } catch (\Throwable $e) {
            Log::error("OrderNotification: Gagal kirim email untuk order #{$order->trx_id} — {$e->getMessage()}");
        }
    }
}
