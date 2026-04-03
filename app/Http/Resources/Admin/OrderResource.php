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
            'trx_id' => $this->trx_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'product' => new ProductResource($this->whenLoaded('product')),
            'payment_method' => $this->paymentMethod ? [
                'id' => $this->paymentMethod->id,
                'name' => $this->paymentMethod->name,
                'image_url' => $this->paymentMethod->image_url,
            ] : null,
            'target_id' => $this->target_id,
            'zone_id' => $this->zone_id,
            'total_price' => (float) $this->total_price,
            'total_price_formatted' => 'Rp ' . number_format($this->total_price, 0, ',', '.'),
            'status' => $this->status,
            'reference' => $this->reference,
            'note' => $this->note,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'extra_data' => $this->extra_data ?? [],
            'created_at' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
