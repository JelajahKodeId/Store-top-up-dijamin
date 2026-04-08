<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->verifiedRedirect($request->user());
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->verifiedRedirect($request->user());
    }

    protected function verifiedRedirect(User $user): RedirectResponse
    {
        if ($user->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard', absolute: false).'?verified=1');
        }

        return redirect()->route('home')->with('success', 'Email berhasil diverifikasi.');
    }
}
