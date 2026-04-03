<?php

namespace App\Services\Admin;

use App\Models\PaymentMethod;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentMethodService
{
    /**
     * Get paginated payment methods
     */
    public function getPaginatedPaymentMethods(array $filters = []): LengthAwarePaginator
    {
        $query = PaymentMethod::latest();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('code', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        return $query->paginate(10)->withQueryString();
    }

    /**
     * Create new payment method
     */
    public function createPaymentMethod(array $data): PaymentMethod
    {
        return DB::transaction(function () use ($data) {
            return PaymentMethod::create($data);
        });
    }

    /**
     * Update payment method
     */
    public function updatePaymentMethod(PaymentMethod $paymentMethod, array $data): PaymentMethod
    {
        return DB::transaction(function () use ($paymentMethod, $data) {
            $paymentMethod->update($data);
            return $paymentMethod;
        });
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(PaymentMethod $paymentMethod): bool
    {
        return $paymentMethod->update([
            'is_active' => !$paymentMethod->is_active
        ]);
    }

    /**
     * Delete payment method
     */
    public function deletePaymentMethod(PaymentMethod $paymentMethod): bool
    {
        if ($paymentMethod->orders()->count() > 0) {
            throw new \Exception('Metode pembayaran tidak dapat dihapus karena sudah memiliki riwayat transaksi/pesanan.');
        }

        return $paymentMethod->delete();
    }
}
