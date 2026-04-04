<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_transaction',
        'quota',
        'used',
        'expired_at',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_transaction' => 'decimal:2',
        'quota' => 'integer',
        'used' => 'integer',
        'expired_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('quota')->orWhereColumn('used', '<', 'quota');
            });
    }
}
