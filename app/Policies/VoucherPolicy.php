<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Auth\Access\HandlesAuthorization;

class VoucherPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function view(User $user, Voucher $voucher): bool
    {
        return $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Voucher $voucher): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Voucher $voucher): bool
    {
        return $user->hasRole('admin');
    }
}
