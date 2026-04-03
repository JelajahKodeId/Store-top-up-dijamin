<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'trx_id',
        'user_id',
        'product_id',
        'target_id',
        'zone_id',
        'total_price',
        'status',
        'payment_method_id',
        'reference',
        'note',
        'customer_name',
        'customer_email',
        'extra_data',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'extra_data' => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    // ─── Email Notification Helpers ───────────────────────────────────────────

    /**
     * Dapatkan email penerima notifikasi.
     * Prioritas: email dari relasi user (member) → customer_email (guest).
     */
    public function getCustomerEmail(): ?string
    {
        return $this->user?->email ?? $this->customer_email;
    }

    /**
     * Dapatkan nama pelanggan untuk email.
     * Prioritas: nama dari relasi user → customer_name → 'Pelanggan'.
     */
    public function getCustomerName(): string
    {
        return $this->user?->name ?? $this->customer_name ?? 'Pelanggan';
    }

    /**
     * Cek apakah order memiliki tujuan email yang valid.
     */
    public function hasEmailRecipient(): bool
    {
        return ! empty($this->getCustomerEmail());
    }
}
