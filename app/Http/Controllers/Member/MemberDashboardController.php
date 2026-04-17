<?php

namespace App\Http\Controllers\Member;

use App\Enums\MemberTier;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tier = MemberTier::fromDatabase($user->getAttributes()['member_tier'] ?? null);

        $ordersQuery = Order::query()->visibleToMember($user)->newestFirst();

        $totalOrders = (clone $ordersQuery)->count();

        $recentOrders = (clone $ordersQuery)
            ->with(['items'])
            ->take(5)
            ->get()
            ->map(fn (Order $order) => $this->mapOrderRow($order));

        return Inertia::render('Member/Home', [
            'totalOrders' => $totalOrders,
            'account' => [
                'full_name' => $user->name,
                'level' => $tier->label(),
                'whatsapp' => $user->phone_number,
                'registered_at' => $user->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * @return array{invoice: string, product: string, status: string, status_label: string, created_at: string}
     */
    protected function mapOrderRow(Order $order): array
    {
        $item = $order->items->first();

        return [
            'invoice' => $order->invoice_code,
            'product' => $item?->product_name ?? 'Produk',
            'status' => $order->status instanceof OrderStatus ? $order->status->value : (string) $order->status,
            'status_label' => $this->memberOrderStatusLabel($order),
            'created_at' => $order->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
        ];
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
