<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPaidMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing(['product', 'paymentMethod', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "✅ Pembayaran #{$this->order->trx_id} Berhasil - Sedang Diproses",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.paid',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
