<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * Get paginated users with filters
     */
    public function getPaginatedUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('roles')->latest();

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('phone_number', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['role'])) {
            $query->role($filters['role']);
        }

        return $query->paginate(10)->withQueryString();
    }

    /**
     * Create new user with role
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone_number' => $data['phone_number'] ?? null,
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole($data['role']);

            return $user;
        });
    }

    /**
     * Update user and sync roles
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone_number' => $data['phone_number'] ?? null,
            ]);

            if (!empty($data['password'])) {
                $user->update(['password' => Hash::make($data['password'])]);
            }

            $user->syncRoles($data['role']);

            return $user;
        });
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user): bool
    {
        if ($user->id === auth()->id()) {
            throw new \Exception('Tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->hasRole('admin') && User::role('admin')->count() <= 1) {
            throw new \Exception('Sistem harus memiliki setidaknya satu administrator.');
        }

        return $user->delete();
    }
}
