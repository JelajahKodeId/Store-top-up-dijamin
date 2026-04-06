<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
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
        'status' => \App\Enums\OrderStatus::class,
        'payment_expired_at' => 'datetime',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(OrderFieldValue::class);
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
                $order->invoice_code = 'INV-' . strtoupper(\Illuminate\Support\Str::random(12));
            }
        });
    }

    public function hasEmailRecipient(): bool
    {
        return !empty($this->customer_email);
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
