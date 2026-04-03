<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'code',
        'fee_flat',
        'fee_percent',
        'image_url',
        'is_active'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
