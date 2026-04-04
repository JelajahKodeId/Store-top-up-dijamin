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
        $query = Order::latest();

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('invoice_code', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_email', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
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
