<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->admin  = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');

        $product  = Product::create(['name' => 'Prime Video', 'slug' => 'prime-video', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id'    => $product->id,
            'name'          => '1 Bulan',
            'duration_days' => 30,
            'price'         => 55000,
            'is_active'     => true,
        ]);

        $this->order = Order::create([
            'customer_email'  => 'buyer@test.com',
            'whatsapp_number' => '0812',
            'invoice_code'    => 'INV-ADMINTEST01',
            'total_price'     => 55000,
            'status'          => OrderStatus::UNPAID,
        ]);

        $this->order->items()->create([
            'product_id'          => $product->id,
            'product_duration_id' => $duration->id,
            'product_name'        => 'Prime Video',
            'duration_name'       => '1 Bulan',
            'price'               => 55000,
            'quantity'            => 1,
        ]);
    }

    public function test_admin_can_view_orders_list(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.orders.index'))
            ->assertOk();
    }

    public function test_member_cannot_access_admin_orders(): void
    {
        $this->actingAs($this->member)
            ->get(route('admin.orders.index'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_to_login_for_admin_routes(): void
    {
        $this->get(route('admin.orders.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_update_order_status(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('admin.orders.update', $this->order), [
                'status' => 'canceled',
                'note'   => 'Dibatalkan oleh admin.',
            ])
            ->assertRedirect();

        $this->order->refresh();
        $this->assertEquals(OrderStatus::CANCELED, $this->order->status);
        $this->assertEquals('Dibatalkan oleh admin.', $this->order->note);
    }

    public function test_admin_setting_order_to_paid_triggers_key_delivery(): void
    {
        $item     = $this->order->items()->with(['product', 'duration'])->first();
        $product  = $item->product;
        $duration = $item->duration;

        ProductKey::create([
            'product_id'          => $product->id,
            'product_duration_id' => $duration->id,
            'key_code'            => 'PRIME-KEY-001',
            'status'              => 'available',
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.orders.update', $this->order), [
                'status' => 'paid',
            ])
            ->assertRedirect();

        $this->order->refresh();
        $this->assertEquals(OrderStatus::SUCCESS, $this->order->status);
        $this->assertTrue($this->order->is_sent);
    }

    public function test_member_cannot_update_order_status(): void
    {
        $this->actingAs($this->member)
            ->patch(route('admin.orders.update', $this->order), ['status' => 'canceled'])
            ->assertForbidden();
    }

    public function test_admin_order_update_with_invalid_status_fails(): void
    {
        $this->actingAs($this->admin)
            ->patch(route('admin.orders.update', $this->order), [
                'status' => 'invalid-status',
            ])
            ->assertSessionHasErrors('status');
    }
}
