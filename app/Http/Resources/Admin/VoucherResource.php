<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'value' => (float) $this->value,
            'min_transaction' => (float) $this->min_transaction,
            'quota' => $this->quota,
            'used' => $this->used,
            'expired_at' => $this->expired_at ? $this->expired_at->toISOString() : null,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->format('d M Y H:i'),
        ];
    }
}
