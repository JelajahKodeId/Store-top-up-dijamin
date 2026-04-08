<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    public function test_public_password_reset_routes_are_disabled(): void
    {
        $this->get('/forgot-password')->assertNotFound();
        $this->post('/forgot-password', ['email' => 'a@example.com'])->assertNotFound();
        $this->get('/reset-password/fake-token')->assertNotFound();
        $this->post('/reset-password', [
            'token' => 'x',
            'email' => 'a@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertNotFound();
    }
}
