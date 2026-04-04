<?php

namespace App\Http\Resources\Admin;

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
            'total_price_formatted' => 'Rp ' . number_format($this->total_price, 0, ',', '.'),
            'discount_amount' => (float) $this->discount_amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'is_sent' => $this->is_sent,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at->format('d M Y H:i'),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'field_values' => OrderFieldValueResource::collection($this->whenLoaded('fieldValues')),
            'voucher' => $this->whenLoaded('voucher'),
            'payment' => $this->whenLoaded('payment'),
        ];
    }
}
