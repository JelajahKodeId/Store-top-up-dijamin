<?php

namespace App\Http\Controllers\Member;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $orders = Order::query()
            ->visibleToMember($user)
            ->with(['items'])
            ->newestFirst()
            ->paginate(10)
            ->through(fn (Order $order) => [
                'invoice' => $order->invoice_code,
                'product' => $order->items->first()?->product_name ?? 'Produk',
                'status' => $order->status instanceof OrderStatus ? $order->status->value : (string) $order->status,
                'status_label' => $this->memberOrderStatusLabel($order),
                'created_at' => $order->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
                'href' => route('orders.status', $order->invoice_code),
            ]);

        return Inertia::render('Member/Orders', [
            'orders' => $orders,
        ]);
    }

    protected function memberOrderStatusLabel(Order $order): string
    {
        $status = $order->status instanceof OrderStatus ? $order->status : OrderStatus::tryFrom((string) $order->status);

        if ($status === OrderStatus::UNPAID
            && $order->payment_expired_at
            && $order->payment_expired_at->isPast()) {
            return 'Expired';
        }

        return $status?->label() ?? (string) $order->status;
    }
}
