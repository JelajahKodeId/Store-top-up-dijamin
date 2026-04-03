<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalanceMutation extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
