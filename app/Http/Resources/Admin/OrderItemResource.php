<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product_name,
            'duration_name' => $this->duration_name,
            'price' => (float) $this->price,
            'price_formatted' => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'keys' => $this->whenLoaded('orderKeys', function () {
                return $this->orderKeys->map(fn ($k) => [
                    'id'           => $k->id,
                    'key_code'     => $k->key_code,
                    'expired_at'   => $k->expired_at?->format('d M Y H:i'),
                    'delivered_at' => $k->delivered_at?->format('d M Y H:i'),
                ]);
            }),
        ];
    }
}
