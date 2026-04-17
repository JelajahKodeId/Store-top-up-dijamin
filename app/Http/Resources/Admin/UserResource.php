<?php

namespace App\Http\Resources\Admin;

use App\Enums\MemberTier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $tier = MemberTier::fromDatabase($this->getAttributes()['member_tier'] ?? null);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'role' => $this->roles->first()?->name ?? 'member',
            'balance' => (float) $this->balance,
            'balance_formatted' => 'Rp '.number_format((float) $this->balance, 0, ',', '.'),
            'member_tier' => $tier->value,
            'member_tier_label' => $tier->label(),
            'created_at' => $this->created_at->format('d M Y H:i'),
            'permissions' => [
                'can_edit' => $request->user()->can('update', $this->resource),
                'can_delete' => $request->user()->can('delete', $this->resource),
            ],
        ];
    }
}
