<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailOtp;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'phone_number', 'balance', 'member_tier', 'email_otp', 'email_otp_expires_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, MustVerifyEmailTrait;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'decimal:2',
            'email_otp_expires_at' => 'datetime',
        ];
    }

    public function sendEmailVerificationNotification()
    {
        $otp = (string) rand(100000, 999999);
        
        $this->update([
            'email_otp' => $otp,
            'email_otp_expires_at' => now()->addMinutes(15),
        ]);

        $this->notify(new VerifyEmailOtp($otp));
    }

    public function tier()
    {
        return $this->belongsTo(MemberTier::class, 'member_tier', 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function walletTopups(): HasMany
    {
        return $this->hasMany(WalletTopup::class);
    }

    public function memberTierUpgrades(): HasMany
    {
        return $this->hasMany(MemberTierUpgrade::class);
    }
}
