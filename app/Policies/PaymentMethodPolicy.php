<?php

namespace App\Policies;

use App\Models\User;
use App\Models\PaymentMethod;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaymentMethodPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function view(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->hasRole('admin');
    }
}
