<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use App\Services\KeyDeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KeyAllocationTest extends TestCase
{
    use RefreshDatabase;

    protected Product $product;
    protected ProductDuration $duration;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->product = Product::create([
            'name'   => 'Canva Pro',
            'slug'   => 'canva-pro',
            'status' => 'active',
        ]);

        $this->duration = ProductDuration::create([
            'product_id'    => $this->product->id,
            'name'          => '3 Bulan',
            'duration_days' => 90,
            'price'         => 80000,
            'is_active'     => true,
        ]);
    }

    private function makeOrderWithItem(): Order
    {
        $order = Order::create([
            'customer_email'  => 'customer@test.com',
            'whatsapp_number' => '08111',
            'invoice_code'    => 'INV-' . uniqid(),
            'total_price'     => 80000,
            'status'          => OrderStatus::PAID,
        ]);

        $order->items()->create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'product_name'        => 'Canva Pro',
            'duration_name'       => '3 Bulan',
            'price'               => 80000,
            'quantity'            => 1,
        ]);

        return $order;
    }

    public function test_deliver_assigns_key_from_pool_and_sets_expires_at(): void
    {
        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'CANVA-KEY-001',
            'status'              => 'available',
        ]);

        $order   = $this->makeOrderWithItem();
        $service = app(KeyDeliveryService::class);
        $service->deliver($order);

        $order->load(['items.orderKeys', 'items.duration']);
        $this->assertEquals(OrderStatus::SUCCESS, $order->status);
        $this->assertTrue($order->is_sent);

        $orderKey = $order->items->first()->orderKeys->first();
        $this->assertNotNull($orderKey, 'OrderKey harus ada setelah delivery');
        $this->assertEquals('CANVA-KEY-001', $orderKey->key_code);
        $this->assertNotNull($orderKey->expired_at);
        $this->assertNotNull($orderKey->delivered_at);

        $productKey = ProductKey::first();
        $this->assertEquals('sold', $productKey->status);
        $this->assertNotNull($productKey->expires_at);
    }

    public function test_deliver_marks_order_failed_when_stock_is_empty(): void
    {
        $order   = $this->makeOrderWithItem();
        $service = app(KeyDeliveryService::class);

        // Pastikan tidak ada key available
        $this->assertEquals(0, ProductKey::where('status', 'available')->count());

        $service->deliver($order);

        $order->refresh();
        $this->assertEquals(OrderStatus::FAILED, $order->status);
    }

    public function test_sold_key_is_not_reallocated(): void
    {
        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'CANVA-USED-KEY',
            'status'              => 'sold',
        ]);

        $order   = $this->makeOrderWithItem();
        $service = app(KeyDeliveryService::class);

        $service->deliver($order);

        $order->refresh();
        // Key 'sold' tidak bisa dialokasikan, order harus FAILED
        $this->assertEquals(OrderStatus::FAILED, $order->status);
        // Key yang sudah sold tetap sold
        $this->assertEquals('sold', ProductKey::first()->status);
    }

    public function test_deliver_is_idempotent_for_already_sent_order(): void
    {
        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'CANVA-KEY-DUPE',
            'status'              => 'available',
        ]);

        $order = $this->makeOrderWithItem();
        $order->update(['is_sent' => true, 'status' => OrderStatus::SUCCESS]);

        $service = app(KeyDeliveryService::class);
        $service->deliver($order->fresh());

        // Tidak ada OrderKey yang dibuat karena is_sent = true
        $this->assertEquals(0, $order->items()->first()->orderKeys()->count());
        // Key tetap available (tidak dikonsumsi)
        $this->assertEquals('available', ProductKey::first()->status);
    }

    public function test_permanent_key_has_no_expires_at(): void
    {
        $permanentDuration = ProductDuration::create([
            'product_id'    => $this->product->id,
            'name'          => 'Seumur Hidup',
            'duration_days' => 0,
            'price'         => 150000,
            'is_active'     => true,
        ]);

        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $permanentDuration->id,
            'key_code'            => 'LIFETIME-KEY',
            'status'              => 'available',
        ]);

        $order = Order::create([
            'whatsapp_number' => '08222',
            'invoice_code'    => 'INV-LIFETIME',
            'total_price'     => 150000,
            'status'          => OrderStatus::PAID,
        ]);

        $order->items()->create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $permanentDuration->id,
            'product_name'        => 'Canva Pro',
            'duration_name'       => 'Seumur Hidup',
            'price'               => 150000,
            'quantity'            => 1,
        ]);

        $service = app(KeyDeliveryService::class);
        $service->deliver($order);

        $order->load('items.orderKeys');
        $orderKey = $order->items->first()->orderKeys->first();
        $this->assertNull($orderKey->expired_at, 'Key seumur hidup tidak boleh punya expired_at');
    }

    public function test_has_enough_stock_returns_correct_boolean(): void
    {
        $order   = $this->makeOrderWithItem();
        $service = app(KeyDeliveryService::class);

        // Awalnya tidak ada key
        $this->assertFalse($service->hasEnoughStock($order->fresh()));

        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'STOCK-KEY-001',
            'status'              => 'available',
        ]);

        $this->assertTrue($service->hasEnoughStock($order->fresh()));
    }
}
