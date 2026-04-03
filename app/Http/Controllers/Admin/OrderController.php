<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Admin\OrderService;
use App\Http\Resources\Admin\OrderResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Order::class);

        $orders = $this->orderService->getPaginatedOrders($request->all());

        return Inertia::render('Admin/Orders/Index', [
            'orders' => OrderResource::collection($orders),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        Gate::authorize('view', $order);

        return Inertia::render('Admin/Orders/Show', [
            'order' => new OrderResource($order->load(['user', 'product.category', 'paymentMethod'])),
        ]);
    }

    /**
     * Update order status manually.
     */
    public function update(Request $request, Order $order)
    {
        Gate::authorize('update', $order);

        $request->validate([
            'status' => 'required|in:unpaid,paid,success,failed,canceled',
            'note' => 'nullable|string|max:500',
        ]);

        $this->orderService->updateStatus($order, $request->status, $request->note);

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }
}
