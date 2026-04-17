<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->get('/register')->assertOk();
    }

    public function test_new_member_can_register_and_redirects_to_member_area(): void
    {
        $response = $this->post('/register', [
            'name' => 'Member Baru',
            'email' => 'member-baru@example.com',
            'phone_number' => '6281234567001',
            'password' => 'Password-1a!',
            'password_confirmation' => 'Password-1a!',
        ]);

        $response->assertRedirect(route('member.home', absolute: false));
        $this->assertAuthenticated();
        $user = User::where('email', 'member-baru@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('member'));
        $this->assertSame('6281234567001', $user->phone_number);
    }
}
