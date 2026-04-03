<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'role' => $this->roles->first()?->name ?? 'member',
            'created_at' => $this->created_at->format('d M Y H:i'),
            'permissions' => [
                'can_edit' => $request->user()->can('update', $this->resource),
                'can_delete' => $request->user()->can('delete', $this->resource),
            ]
        ];
    }
}
