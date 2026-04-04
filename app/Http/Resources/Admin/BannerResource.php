<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image' => $this->image_url,
            'link' => $this->link,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
