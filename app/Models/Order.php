<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'whatsapp_number',
        'invoice_code',
        'total_price',
        'discount_amount',
        'status',
        'payment_method',
        'is_sent',
        'voucher_id',
        'ip_address',
        'note',
        'payment_reference',
        'payment_url',
        'payment_expired_at',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'is_sent' => 'boolean',
        'status' => OrderStatus::class,
        'payment_expired_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    /**
     * Pesanan milik member: terikat user_id atau nomor WA sama (pesanan lama guest).
     */
    public function scopeVisibleToMember(Builder $query, User $user): Builder
    {
        return $query->where(function (Builder $q) use ($user) {
            $q->where('user_id', $user->id);
            if ($user->phone_number) {
                $digits = preg_replace('/\D+/', '', $user->phone_number);
                if ($digits !== '') {
                    $q->orWhereRaw(
                        "REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(whatsapp_number,''), '+', ''), '-', ''), ' ', ''), '.', '') = ?",
                        [$digits]
                    )->orWhereRaw(
                        "REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(customer_phone,''), '+', ''), '-', ''), ' ', ''), '.', '') = ?",
                        [$digits]
                    );
                }
            }
        });
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(OrderFieldValue::class)->orderBy('id');
    }

    /**
     * Pesanan terbaru di atas: waktu buat dulu, lalu id (stabil bila created_at sama).
     */
    public function scopeNewestFirst(Builder $query): Builder
    {
        return $query->orderByDesc('created_at')->orderByDesc('id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    protected static function booted()
    {
        parent::booted();
        static::creating(function ($order) {
            if (empty($order->invoice_code)) {
                $order->invoice_code = 'INV-'.strtoupper(Str::random(12));
            }
        });
    }

    public function hasEmailRecipient(): bool
    {
        return ! empty($this->customer_email);
    }

    public function getCustomerEmail(): string
    {
        return $this->customer_email;
    }

    public function getCustomerName(): string
    {
        return $this->customer_name;
    }
}
