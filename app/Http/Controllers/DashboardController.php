<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductKey;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function admin(): Response
    {
        $totalOrders = Order::count();
        $successOrders = Order::where('status', OrderStatus::SUCCESS)->count();
        $pendingOrders = Order::whereIn('status', [OrderStatus::UNPAID, OrderStatus::PAID])->count();

        $stats = [
            'revenue' => (float) Order::where('status', OrderStatus::SUCCESS)->sum('total_price'),
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'total_members' => User::role('member')->count(),
            'success_rate' => $totalOrders > 0
                ? round(($successOrders / $totalOrders) * 100, 1)
                : 0,
            'low_stock_keys' => ProductKey::where('status', 'available')->count(),
        ];

        $recentOrders = Order::with(['items'])
            ->newestFirst()
            ->take(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->invoice_code,
                'product' => $order->items->first()?->product_name ?? 'Produk Dihapus',
                'customer' => $order->customer_name ?? $order->whatsapp_number ?? '-',
                'amount' => 'Rp '.number_format($order->total_price, 0, ',', '.'),
                'status' => $order->status instanceof OrderStatus ? $order->status->value : $order->status,
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Display the member dashboard.
     */
    public function member(Request $request)
    {
        if ($request->user()->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($request->user()->hasRole('member')) {
            return redirect()->route('member.home');
        }

        return redirect()->route('home')
            ->with('error', 'Akun Anda belum memiliki role member. Hubungi administrator.');
    }
}
