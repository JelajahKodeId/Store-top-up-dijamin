<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = [
        'product_id',
        'author_name',
        'rating',
        'body',
        'invoice_code',
        'verified_purchase',
        'is_published',
    ];

    protected $casts = [
        'verified_purchase' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Jangan expose nomor invoice penuh ke JSON publik (hanya dipakai internal / admin).
     */
    protected $hidden = [
        'invoice_code',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
