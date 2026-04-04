<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing(['items']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "❌ Pesanan #{$this->order->invoice_code} Gagal",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.failed',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
