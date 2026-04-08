<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use App\Services\Payment\MockPaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    protected Order $order;

    protected Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->instance(PaymentGatewayInterface::class, new MockPaymentService);

        $this->seed(RolePermissionSeeder::class);

        $product = Product::create(['name' => 'Spotify', 'slug' => 'spotify', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id,
            'name' => '1 Bulan',
            'duration_days' => 30,
            'price' => 30000,
            'is_active' => true,
        ]);

        ProductKey::create([
            'product_id' => $product->id,
            'product_duration_id' => $duration->id,
            'key_code' => 'SPOTIFY-KEY-001',
            'status' => 'available',
        ]);

        $this->order = Order::create([
            'customer_email' => 'test@example.com',
            'customer_name' => 'Tester',
            'whatsapp_number' => '081234567890',
            'invoice_code' => 'INV-TESTINVOICE01',
            'total_price' => 30000,
            'status' => 'unpaid',
        ]);

        $this->order->items()->create([
            'product_id' => $product->id,
            'product_duration_id' => $duration->id,
            'product_name' => 'Spotify',
            'duration_name' => '1 Bulan',
            'price' => 30000,
            'quantity' => 1,
        ]);

        $this->payment = Payment::create([
            'order_id' => $this->order->id,
            'gateway' => 'mock',
            'reference_id' => 'MOCK-TESTREF001',
            'amount' => 30000,
            'status' => 'pending',
        ]);

        $this->order->update(['payment_reference' => 'MOCK-TESTREF001']);
    }

    public function test_valid_paid_webhook_allocates_keys_and_sets_success(): void
    {
        $response = $this->postJson(route('webhooks.payment'), [
            'reference' => 'MOCK-TESTREF001',
            'status' => 'paid',
            'amount' => 30000,
        ]);

        $response->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals(OrderStatus::SUCCESS, $this->order->status);
        $this->assertTrue($this->order->is_sent);

        $key = ProductKey::first();
        $this->assertEquals('sold', $key->status);
        $this->assertNotNull($key->expires_at);

        $orderKey = $this->order->items()->first()->orderKeys()->first();
        $this->assertNotNull($orderKey, 'OrderKey harus ada setelah webhook sukses');
    }

    public function test_invalid_signature_webhook_returns_403(): void
    {
        $response = $this->postJson(route('webhooks.payment'), [
            'reference' => 'MOCK-TESTREF001',
            'status' => 'paid',
        ], ['X-Callback-Signature' => 'wrong-signature']);

        $response->assertStatus(403);

        $this->order->refresh();
        $this->assertEquals(OrderStatus::UNPAID, $this->order->status);
    }

    public function test_duplicate_paid_webhook_is_ignored(): void
    {
        $this->order->update(['status' => OrderStatus::SUCCESS]);

        $response = $this->postJson(route('webhooks.payment'), [
            'reference' => 'MOCK-TESTREF001',
            'status' => 'paid',
        ], ['X-Callback-Signature' => 'mock']);

        $response->assertStatus(200);
        $this->assertEquals(OrderStatus::SUCCESS, $this->order->fresh()->status);
    }

    public function test_failed_webhook_marks_order_as_failed(): void
    {
        $response = $this->postJson(route('webhooks.payment'), [
            'reference' => 'MOCK-TESTREF001',
            'status' => 'failed',
        ], ['X-Callback-Signature' => 'mock']);

        $response->assertStatus(200);

        $this->order->refresh();
        $this->assertEquals(OrderStatus::FAILED, $this->order->status);

        $this->payment->refresh();
        $this->assertEquals('failed', $this->payment->status);
    }

    public function test_mock_webhook_endpoint_works_in_local(): void
    {
        $response = $this->get(route('webhooks.mock', $this->order->invoice_code));
        $response->assertRedirect();

        $this->order->refresh();
        $this->assertEquals(OrderStatus::SUCCESS, $this->order->status);
    }
}
