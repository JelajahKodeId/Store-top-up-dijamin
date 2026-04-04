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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'status' => $this->status,
            'fields' => $this->fields->map(fn($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'label' => $f->label,
                'type' => $f->type,
                'placeholder' => $f->placeholder,
                'validation' => $f->validation,
                'is_required' => $f->is_required,
                'sort_order' => $f->sort_order,
            ]),
            'durations' => $this->durations->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'duration_days' => $d->duration_days,
                'price' => (float) $d->price,
                'price_formatted' => 'Rp ' . number_format($d->price, 0, ',', '.'),
                'is_active' => $d->is_active,
            ]),
            'keys_count' => $this->keys()->where('status', 'available')->count(),
            'created_at' => $this->created_at->format('d M Y'),
        ];
    }
}
