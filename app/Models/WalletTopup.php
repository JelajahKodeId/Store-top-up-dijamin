<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WalletTopup extends Model
{
    protected $fillable = [
        'user_id',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted(): void
    {
        static::creating(function (WalletTopup $topup) {
            if (empty($topup->invoice_code)) {
                $topup->invoice_code = 'WTU-'.strtoupper(Str::random(12));
            }
        });
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
