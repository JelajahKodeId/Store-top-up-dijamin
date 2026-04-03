<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'fee_flat' => (float) $this->fee_flat,
            'fee_percent' => (float) $this->fee_percent,
            'image_url' => $this->image_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=random',
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at->format('d M Y'),
        ];
    }
}
