<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductField;
use App\Models\ProductKey;
use App\Models\Voucher;
use App\Services\Payment\MockPaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected Product $product;
    protected ProductDuration $duration;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->app->instance(PaymentGatewayInterface::class, new MockPaymentService());

        $this->product = Product::create([
            'name'   => 'Netflix 1 Bulan',
            'slug'   => 'netflix-1-bulan',
            'status' => 'active',
        ]);

        $this->duration = ProductDuration::create([
            'product_id'    => $this->product->id,
            'name'          => '1 Bulan',
            'duration_days' => 30,
            'price'         => 50000,
            'is_active'     => true,
        ]);

        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'TEST-KEY-001',
            'status'              => 'available',
        ]);
    }

    public function test_checkout_valid_creates_order_and_payment(): void
    {
        $response = $this->post(route('checkout.store'), [
            'product_id'     => $this->product->id,
            'duration_id'    => $this->duration->id,
            'customer_name'  => 'Budi',
            'customer_email' => 'budi@example.com',
            'whatsapp'       => '081234567890',
            'payment_method' => 'QRIS',
        ]);

        $response->assertRedirect();

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals(OrderStatus::UNPAID, $order->status);
        $this->assertEquals('budi@example.com', $order->customer_email);
        $this->assertNotNull($order->payment);
        $this->assertEquals('mock', $order->payment->gateway);
        $this->assertEquals('pending', $order->payment->status);
    }

    public function test_checkout_inactive_product_fails(): void
    {
        $this->product->update(['status' => 'inactive']);

        $response = $this->post(route('checkout.store'), [
            'product_id'  => $this->product->id,
            'duration_id' => $this->duration->id,
            'whatsapp'    => '081234567890',
        ]);

        $response->assertStatus(404);
        $this->assertEquals(0, Order::count());
    }

    public function test_checkout_inactive_duration_fails(): void
    {
        $this->duration->update(['is_active' => false]);

        $response = $this->post(route('checkout.store'), [
            'product_id'  => $this->product->id,
            'duration_id' => $this->duration->id,
            'whatsapp'    => '081234567890',
        ]);

        $response->assertStatus(404);
    }

    public function test_checkout_with_valid_voucher_applies_discount(): void
    {
        Voucher::create([
            'code'            => 'DISKON10K',
            'type'            => 'fixed',
            'value'           => 10000,
            'min_transaction' => 0,
            'quota'           => 10,
            'used'            => 0,
            'is_active'       => true,
        ]);

        $this->post(route('checkout.store'), [
            'product_id'   => $this->product->id,
            'duration_id'  => $this->duration->id,
            'whatsapp'     => '081234567890',
            'voucher_code' => 'DISKON10K',
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals(10000, $order->discount_amount);
        $this->assertEquals(40000, $order->total_price);

        Voucher::first()->refresh();
        $this->assertEquals(1, Voucher::first()->used);
    }

    public function test_checkout_with_invalid_voucher_returns_error(): void
    {
        $response = $this->post(route('checkout.store'), [
            'product_id'   => $this->product->id,
            'duration_id'  => $this->duration->id,
            'whatsapp'     => '081234567890',
            'voucher_code' => 'TIDAK_ADA',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('voucher_code');
        $this->assertEquals(0, Order::count());
    }

    public function test_checkout_with_expired_voucher_returns_error(): void
    {
        Voucher::create([
            'code'       => 'EXPIRED',
            'type'       => 'fixed',
            'value'      => 5000,
            'is_active'  => true,
            'expired_at' => now()->subDay(),
        ]);

        $response = $this->post(route('checkout.store'), [
            'product_id'   => $this->product->id,
            'duration_id'  => $this->duration->id,
            'whatsapp'     => '081234567890',
            'voucher_code' => 'EXPIRED',
        ]);

        $response->assertSessionHasErrors('voucher_code');
    }

    public function test_checkout_with_dynamic_fields_saves_field_values(): void
    {
        $field = ProductField::create([
            'product_id'  => $this->product->id,
            'name'        => 'user_id',
            'label'       => 'User ID',
            'type'        => 'text',
            'is_required' => true,
            'sort_order'  => 1,
        ]);

        $this->post(route('checkout.store'), [
            'product_id'  => $this->product->id,
            'duration_id' => $this->duration->id,
            'whatsapp'    => '081234567890',
            'fields'      => [$field->id => '12345678'],
        ]);

        $order = Order::with('fieldValues')->first();
        $this->assertNotNull($order);
        $this->assertCount(1, $order->fieldValues);
        $this->assertEquals('12345678', $order->fieldValues->first()->value);
    }

    public function test_checkout_missing_whatsapp_returns_validation_error(): void
    {
        $response = $this->post(route('checkout.store'), [
            'product_id'  => $this->product->id,
            'duration_id' => $this->duration->id,
        ]);

        $response->assertSessionHasErrors('whatsapp');
    }
}
