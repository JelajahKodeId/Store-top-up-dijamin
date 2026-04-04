<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderKey extends Model
{
    protected $fillable = [
        'order_item_id',
        'product_key_id',
        'key_code',
        'expired_at',
    ];

    protected $casts = [
        'expired_at' => 'datetime',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function productKey(): BelongsTo
    {
        return $this->belongsTo(ProductKey::class);
    }
}
