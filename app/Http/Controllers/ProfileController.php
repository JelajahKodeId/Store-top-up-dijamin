<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the admin profile form inside the admin panel.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Admin/Profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('admin.profile.edit')->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Admin account deletion is disabled for security reasons.
     * Only developers can remove admin accounts directly via database.
     */
    public function destroy(Request $request): RedirectResponse
    {
        return Redirect::route('admin.profile.edit')
            ->with('error', 'Akun Super Administrator tidak dapat dihapus melalui panel.');
    }
}
