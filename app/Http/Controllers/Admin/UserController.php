<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\Order;
use App\Models\User;
use App\Services\Admin\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $users = $this->userService->getPaginatedUsers($request->all());

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        Gate::authorize('view', $user);

        // Pesanan: email sama (guest / lama) atau terikat user_id (checkout saat login member)
        $recentOrders = Order::query()
            ->where(function ($q) use ($user) {
                $q->where('customer_email', $user->email)
                    ->orWhere('user_id', $user->id);
            })
            ->newestFirst()
            ->take(10)
            ->get()
            ->map(fn ($o) => [
                'invoice_code' => $o->invoice_code,
                'status' => $o->status instanceof OrderStatus ? $o->status->value : $o->status,
                'total_price_formatted' => 'Rp '.number_format($o->total_price, 0, ',', '.'),
                'created_at' => $o->created_at->format('d M Y H:i'),
            ]);

        $walletTopups = $user->walletTopups()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(10)
            ->get()
            ->map(fn ($t) => [
                'invoice_code' => $t->invoice_code,
                'amount_formatted' => 'Rp '.number_format((float) $t->amount, 0, ',', '.'),
                'status' => $t->status,
                'created_at' => $t->created_at->format('d M Y H:i'),
            ]);

        $tierUpgrades = $user->memberTierUpgrades()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->take(10)
            ->get()
            ->map(fn ($u) => [
                'invoice_code' => $u->invoice_code,
                'target_label' => $u->target_tier->label(),
                'amount_formatted' => 'Rp '.number_format((float) $u->amount, 0, ',', '.'),
                'status' => $u->status,
                'created_at' => $u->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user->load('roles')),
            'recentOrders' => $recentOrders,
            'walletTopups' => $walletTopups,
            'tierUpgrades' => $tierUpgrades,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        Gate::authorize('update', User::class);

        try {
            $this->userService->createUser($request->validated());

            return back()->with('success', 'Pengguna berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('User store failed: '.$e->getMessage());

            return back()->with('error', 'Gagal menambahkan pengguna: '.$e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        Gate::authorize('update', $user);

        try {
            $this->userService->updateUser($user, $request->validated());

            return back()->with('success', 'Data pengguna berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('User update failed: '.$e->getMessage());

            return back()->with('error', 'Gagal memperbarui pengguna: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        Gate::authorize('delete', $user);

        try {
            $this->userService->deleteUser($user);

            return back()->with('success', 'Pengguna berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
