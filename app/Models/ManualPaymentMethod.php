<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManualPaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'account_number',
        'account_name',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'image_url',
    ];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return str_starts_with($this->image, 'http') ? $this->image : \Illuminate\Support\Facades\Storage::url($this->image);
        }
        return null;
    }
}
