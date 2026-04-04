<?php

namespace App\Http\Controllers;

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
        $stats = [
            'revenue' => \App\Models\Order::where('status', 'success')->sum('total_price'),
            'total_orders' => \App\Models\Order::count(),
            'total_members' => \App\Models\User::role('member')->count(),
            'success_rate' => \App\Models\Order::count() > 0 
                ? round((\App\Models\Order::where('status', 'success')->count() / \App\Models\Order::count()) * 100, 1) 
                : 0,
        ];

        $recentOrders = \App\Models\Order::with(['items'])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->invoice_code,
                    'product' => $order->items->first()?->product_name ?? 'Produk Dihapus',
                    'customer' => $order->customer_name,
                    'amount' => 'Rp ' . number_format($order->total_price, 0, ',', '.'),
                    'status' => $order->status,
                ];
            });

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

        return Inertia::render('Dashboard');
    }
}
