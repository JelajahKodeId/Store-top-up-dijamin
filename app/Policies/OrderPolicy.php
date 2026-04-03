<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function view(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }
}
