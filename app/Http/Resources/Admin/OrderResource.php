<?php

namespace App\Http\Resources\Admin;

use App\Enums\OrderStatus;
use App\Support\PaymentLabels;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_code' => $this->invoice_code,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'whatsapp_number' => $this->whatsapp_number,
            'total_price' => (float) $this->total_price,
            'total_price_formatted' => 'Rp '.number_format($this->total_price, 0, ',', '.'),
            'discount_amount' => (float) $this->discount_amount,
            'status' => $this->status instanceof OrderStatus ? $this->status->value : $this->status,
            'status_label' => $this->status instanceof OrderStatus ? $this->status->label() : $this->status,
            'note' => $this->note,
            'payment_method' => $this->payment_method,
            'payment_method_display' => PaymentLabels::methodLabel(
                $this->payment_method,
                $this->relationLoaded('payment') ? $this->payment?->gateway : null
            ),
            'payment_reference' => $this->payment_reference,
            'payment_url' => $this->payment_url,
            'payment_expired_at' => $this->payment_expired_at?->format('d M Y H:i'),
            'payment_record' => $this->whenLoaded('payment', function () {
                if (! $this->payment) {
                    return null;
                }

                return [
                    'gateway' => $this->payment->gateway,
                    'reference_id' => $this->payment->reference_id,
                    'status' => $this->payment->status,
                    'amount' => (float) $this->payment->amount,
                    'paid_at' => $this->payment->paid_at?->format('d M Y H:i'),
                ];
            }),
            'is_sent' => $this->is_sent,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at->format('d M Y H:i'),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'field_values' => OrderFieldValueResource::collection($this->whenLoaded('fieldValues')),
            'voucher' => $this->whenLoaded('voucher'),
        ];
    }
}
