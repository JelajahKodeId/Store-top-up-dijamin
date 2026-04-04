<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\UserService;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\Admin\UserResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

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

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user->load('roles')),
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
            \Illuminate\Support\Facades\Log::error('User store failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan pengguna: ' . $e->getMessage());
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
            \Illuminate\Support\Facades\Log::error('User update failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui pengguna: ' . $e->getMessage());
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
