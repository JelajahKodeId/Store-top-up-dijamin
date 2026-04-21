<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Get paginated users with filters
     */
    public function getPaginatedUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('roles')->latest()->orderByDesc('id');

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('email', 'like', '%'.$filters['search'].'%')
                    ->orWhere('phone_number', 'like', '%'.$filters['search'].'%');
            });
        }

        if (! empty($filters['role'])) {
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
            $tier = 'standard';
            if (($data['role'] ?? '') === 'member' && ! empty($data['member_tier'])) {
                $tier = (string) $data['member_tier'];
            }

            $balance = 0;
            if (($data['role'] ?? '') === 'member' && isset($data['balance']) && $data['balance'] !== null && $data['balance'] !== '') {
                $balance = (float) $data['balance'];
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone_number' => $data['phone_number'] ?? null,
                'password' => Hash::make($data['password']),
                'member_tier' => $tier,
                'balance' => $balance,
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

            if (! empty($data['password'])) {
                $user->update(['password' => Hash::make($data['password'])]);
            }

            $user->syncRoles($data['role']);
            $user->refresh();

            if ($user->hasRole('member')) {
                $memberPatch = [];
                if (! empty($data['member_tier'])) {
                    $memberPatch['member_tier'] = (string) $data['member_tier'];
                }
                if (array_key_exists('balance', $data) && $data['balance'] !== null && $data['balance'] !== '') {
                    $memberPatch['balance'] = (float) $data['balance'];
                }
                if ($memberPatch !== []) {
                    $user->update($memberPatch);
                }
            }

            return $user->refresh();
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
