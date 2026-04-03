<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_id' => $this->category_id,
            'name' => $this->name,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'price_formatted' => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'discount_price_formatted' => $this->discount_price ? 'Rp ' . number_format($this->discount_price, 0, ',', '.') : null,
            'is_active' => (bool) $this->is_active,
            'is_available' => (bool) $this->is_available,
            'created_at' => $this->created_at->format('d M Y'),
        ];
    }
}
