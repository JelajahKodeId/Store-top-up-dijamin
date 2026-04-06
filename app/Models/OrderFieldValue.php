<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderFieldValue extends Model
{
    protected $fillable = [
        'order_id',
        'product_field_id',
        'value',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(ProductField::class, 'product_field_id');
    }

    public function getFieldNameAttribute(): string
    {
        return $this->field?->label ?? $this->field?->name ?? 'Field';
    }

    public function getFieldValueAttribute(): string
    {
        return $this->value ?? '';
    }
}
