<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class MemberTierUpgrade extends Model
{
    protected $fillable = [
        'user_id',
        'target_tier',
        'invoice_code',
        'amount',
        'status',
        'gateway',
        'gateway_payment_reference',
        'payment_method',
        'payment_url',
        'payment_expired_at',
        'paid_at',
        'payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_expired_at' => 'datetime',
        'paid_at' => 'datetime',
        'payload' => 'array',
    ];

    public function targetTier(): BelongsTo
    {
        return $this->belongsTo(MemberTier::class, 'target_tier', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted(): void
    {
        static::creating(function (MemberTierUpgrade $row) {
            if (empty($row->invoice_code)) {
                $row->invoice_code = 'MPK-'.strtoupper(Str::random(12));
            }
        });
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
