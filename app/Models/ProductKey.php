<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductKey extends Model
{
    protected $fillable = [
        'product_id',
        'product_duration_id',
        'key_code',
        'status',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function duration(): BelongsTo
    {
        return $this->belongsTo(ProductDuration::class, 'product_duration_id');
    }
}
