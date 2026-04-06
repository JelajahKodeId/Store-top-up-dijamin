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
     *
     * DINONAKTIFKAN: Email notifikasi saat ini tidak aktif.
     * Aktifkan kembali dengan set EMAIL_NOTIFICATIONS_ENABLED=true di .env
     * Saat ini hanya WhatsApp yang digunakan untuk notifikasi ke customer.
     */
    public function sendForStatus(Order $order): void
    {
        if (! config('services.email_notifications_enabled', false)) {
            Log::debug("OrderNotification: Email dinonaktifkan (EMAIL_NOTIFICATIONS_ENABLED=false). Order #{$order->invoice_code} dilewati.");
            return;
        }

        if (! $order->hasEmailRecipient()) {
            Log::info("OrderNotification: Order #{$order->invoice_code} tidak memiliki email tujuan, dilewati.");
            return;
        }

        $email    = $order->getCustomerEmail();
        $mailable = match ($order->status) {
            \App\Enums\OrderStatus::UNPAID   => new OrderCreatedMail($order),
            \App\Enums\OrderStatus::PAID     => new OrderPaidMail($order),
            \App\Enums\OrderStatus::SUCCESS  => new OrderSuccessMail($order),
            \App\Enums\OrderStatus::FAILED,
            \App\Enums\OrderStatus::CANCELED => new OrderFailedMail($order),
            default                          => null,
        };

        if ($mailable === null) {
            return;
        }

        try {
            Mail::to($email)->queue($mailable);
            Log::info("OrderNotification: Email '{$order->status->value}' dikirim ke {$email} untuk order #{$order->invoice_code}");
        } catch (\Throwable $e) {
            Log::error("OrderNotification: Gagal kirim email untuk order #{$order->invoice_code} — {$e->getMessage()}");
        }
    }
}
