<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\KeyDeliveryService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class OrderService
{
    public function __construct(
        protected KeyDeliveryService $keyDeliveryService
    ) {}
    /**
     * Get paginated orders with filters
     */
    public function getPaginatedOrders(array $filters = []): LengthAwarePaginator
    {
        $query = Order::latest();

        if (!empty($filters['search'])) {
            $s = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($s) {
                $q->where('invoice_code', 'like', $s)
                  ->orWhere('customer_name', 'like', $s)
                  ->orWhere('customer_email', 'like', $s)
                  ->orWhere('whatsapp_number', 'like', $s)
                  ->orWhere('payment_reference', 'like', $s);
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
            'note'   => $note ?? $order->note,
        ]);

        // Jika admin set ke PAID secara manual, langsung deliver key otomatis
        if ($status === OrderStatus::PAID->value) {
            try {
                $this->keyDeliveryService->deliver($order->fresh());
            } catch (\Throwable $e) {
                Log::error("OrderService: Gagal deliver key untuk #{$order->invoice_code} — {$e->getMessage()}");
            }
        }

        return $order;
    }
}
