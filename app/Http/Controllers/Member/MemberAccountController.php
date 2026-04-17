<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\MemberProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberAccountController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $name = $user->name ?? '';
        $parts = preg_split('/\s+/', trim($name), 2, PREG_SPLIT_NO_EMPTY);
        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? '';

        return Inertia::render('Member/Settings', [
            'profile' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
            ],
        ]);
    }

    public function update(MemberProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->name = $request->fullName();
        $user->email = $request->validated('email');

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()->route('member.settings.edit')->with('success', 'Pengaturan akun berhasil disimpan.');
    }
}
