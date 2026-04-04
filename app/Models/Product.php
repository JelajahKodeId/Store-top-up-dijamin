<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'status',
    ];

    public function durations(): HasMany
    {
        return $this->hasMany(ProductDuration::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(ProductField::class);
    }

    public function keys(): HasMany
    {
        return $this->hasMany(ProductKey::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
