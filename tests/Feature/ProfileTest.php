<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    public function test_admin_profile_page_is_displayed(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get(route('admin.profile.edit'))
            ->assertOk();
    }

    public function test_admin_profile_information_can_be_updated(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->patch(route('admin.profile.update'), [
                'name'  => 'Admin Updated',
                'email' => 'adminupdated@example.com',
            ]);

        $response->assertSessionHasNoErrors()->assertRedirect();

        $admin->refresh();
        $this->assertSame('Admin Updated', $admin->name);
        $this->assertSame('adminupdated@example.com', $admin->email);
    }

    public function test_member_cannot_access_admin_profile(): void
    {
        $member = User::factory()->create();
        $member->assignRole('member');

        $this->actingAs($member)
            ->get(route('admin.profile.edit'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_from_admin_profile(): void
    {
        $this->get(route('admin.profile.edit'))
            ->assertRedirect(route('login'));
    }
}
