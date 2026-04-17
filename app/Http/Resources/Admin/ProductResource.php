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
            'image_url' => $this->image_url,
            'telegram_group_invite_url' => $this->telegram_group_invite_url,
            'status' => $this->status,
            'platform_type' => $this->platform_type,
            'game_category' => $this->game_category,
            'game_category_label' => $this->game_category_label,
            'reviews' => $this->whenLoaded('reviews', fn () => $this->reviews->map(fn ($r) => [
                'id' => $r->id,
                'author_name' => $r->author_name,
                'rating' => (int) $r->rating,
                'body' => $r->body,
                'invoice_code' => $r->invoice_code,
                'verified_purchase' => (bool) $r->verified_purchase,
                'is_published' => (bool) $r->is_published,
                'created_at' => $r->created_at->format('d M Y, H:i'),
            ])),
            'fields' => $this->fields->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'label' => $f->label,
                'type' => $f->type,
                'placeholder' => $f->placeholder,
                'validation' => $f->validation,
                'is_required' => $f->is_required,
                'sort_order' => $f->sort_order,
            ]),
            'durations' => $this->durations->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'duration_days' => $d->duration_days,
                'price' => (float) $d->price,
                'price_formatted' => 'Rp '.number_format($d->price, 0, ',', '.'),
                'is_active' => $d->is_active,
                'available_keys_count' => $d->available_keys_count ?? 0,
            ]),
            'keys_count' => $this->keys_count ?? $this->keys()->where('status', 'available')->count(),
            'created_at' => $this->created_at->format('d M Y'),
        ];
    }
}
