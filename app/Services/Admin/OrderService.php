<?php

namespace App\Services\Admin;

use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    /**
     * Get paginated orders with filters
     */
    public function getPaginatedOrders(array $filters = []): LengthAwarePaginator
    {
        $query = Order::with(['user', 'product.category', 'paymentMethod'])->latest();

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('trx_id', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('reference', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_email', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Update order status manually
     */
    public function updateStatus(Order $order, string $status, ?string $note = null): Order
    {
        $order->update([
            'status' => $status,
            'note' => $note ?? $order->note,
        ]);

        return $order;
    }
}
