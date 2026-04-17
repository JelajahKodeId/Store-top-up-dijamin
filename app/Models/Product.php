<?php

namespace App\Models;

use App\Support\ProductGameCategory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'telegram_group_invite_url',
        'status',
        'platform_type',
        'game_category',
    ];

    protected $appends = ['image_url', 'game_category_label'];

    /**
     * Nilai kolom `image`: URL absolut, atau path relatif di disk public (mis. products/abc.jpg).
     */
    public static function publicUrlForStoredImage(?string $stored): ?string
    {
        if ($stored === null || $stored === '') {
            return null;
        }
        $stored = trim($stored);
        if (preg_match('#^(https?:)?//#i', $stored)) {
            return $stored;
        }
        if (str_starts_with($stored, '/storage/')) {
            return $stored;
        }

        return '/storage/'.ltrim($stored, '/');
    }

    /**
     * File yang tersimpan di storage/app/public (bukan URL eksternal) — untuk hapus file aman.
     */
    public static function isRelativeStoragePath(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }
        if (preg_match('#^(https?:)?//#i', $value)) {
            return false;
        }
        if (str_starts_with($value, '/storage/')) {
            return false;
        }

        return true;
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::get(
            fn () => self::publicUrlForStoredImage($this->attributes['image'] ?? null)
        );
    }

    protected function gameCategoryLabel(): Attribute
    {
        return Attribute::get(
            fn () => ProductGameCategory::label($this->attributes['game_category'] ?? null)
        );
    }

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

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
