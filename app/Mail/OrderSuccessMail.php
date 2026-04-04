<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderSuccessMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing(['items.orderKeys', 'fieldValues']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "💎 Key Berhasil Terkirim - Pesanan #{$this->order->invoice_code}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.success',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
