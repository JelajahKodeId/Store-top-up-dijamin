<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberTier extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'level',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'level' => 'integer',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'member_tier', 'id');
    }

    public function upgrades()
    {
        return $this->hasMany(MemberTierUpgrade::class, 'target_tier', 'id');
    }
}
