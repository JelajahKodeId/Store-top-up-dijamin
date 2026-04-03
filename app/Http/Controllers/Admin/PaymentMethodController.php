<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Services\Admin\PaymentMethodService;
use App\Http\Requests\Admin\PaymentMethodRequest;
use App\Http\Resources\Admin\PaymentMethodResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class PaymentMethodController extends Controller
{
    protected $paymentMethodService;

    public function __construct(PaymentMethodService $paymentMethodService)
    {
        $this->paymentMethodService = $paymentMethodService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', PaymentMethod::class);

        $paymentMethods = $this->paymentMethodService->getPaginatedPaymentMethods($request->all());

        return Inertia::render('Admin/PaymentMethods/Index', [
            'paymentMethods' => PaymentMethodResource::collection($paymentMethods),
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentMethod $paymentMethod)
    {
        Gate::authorize('view', $paymentMethod);

        return Inertia::render('Admin/PaymentMethods/Show', [
            'paymentMethod' => new PaymentMethodResource($paymentMethod),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PaymentMethodRequest $request)
    {
        Gate::authorize('create', PaymentMethod::class);

        $this->paymentMethodService->createPaymentMethod($request->validated());

        return back()->with('success', 'Metode pembayaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod)
    {
        Gate::authorize('update', $paymentMethod);

        $this->paymentMethodService->updatePaymentMethod($paymentMethod, $request->validated());

        return back()->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        Gate::authorize('delete', $paymentMethod);

        try {
            $this->paymentMethodService->deletePaymentMethod($paymentMethod);
            return back()->with('success', 'Metode pembayaran berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
