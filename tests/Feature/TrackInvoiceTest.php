<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackInvoiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    private function makeOrder(array $attrs = []): Order
    {
        $product  = Product::create(['name' => 'HBO', 'slug' => 'hbo', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id'    => $product->id,
            'name'          => '1 Bulan',
            'duration_days' => 30,
            'price'         => 70000,
            'is_active'     => true,
        ]);

        $order = Order::create(array_merge([
            'customer_name'   => 'Ani',
            'customer_email'  => 'ani@example.com',
            'whatsapp_number' => '081111111111',
            'invoice_code'    => 'INV-TRACKTEST01',
            'total_price'     => 70000,
            'status'          => OrderStatus::UNPAID,
        ], $attrs));

        $order->items()->create([
            'product_id'          => $product->id,
            'product_duration_id' => $duration->id,
            'product_name'        => 'HBO',
            'duration_name'       => '1 Bulan',
            'price'               => 70000,
            'quantity'            => 1,
        ]);

        return $order;
    }

    public function test_track_invoice_page_loads(): void
    {
        $this->get(route('track-invoice'))->assertOk();
    }

    public function test_search_valid_invoice_returns_order_data(): void
    {
        $this->makeOrder();

        $response = $this->get(route('landing.track.search', ['invoice' => 'INV-TRACKTEST01']));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Guest/TrackInvoice')
                 ->has('order')
                 ->where('order.invoice_code', 'INV-TRACKTEST01')
                 ->where('order.status', 'unpaid')
        );
    }

    public function test_search_nonexistent_invoice_returns_null_order(): void
    {
        $response = $this->get(route('landing.track.search', ['invoice' => 'INV-TIDAK-ADA']));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Guest/TrackInvoice')
                 ->where('order', null)
                 ->where('searched', true)
        );
    }

    public function test_search_without_invoice_redirects(): void
    {
        $response = $this->get(route('landing.track.search'));
        $response->assertRedirect();
    }

    public function test_success_order_includes_keys_in_response(): void
    {
        $order = $this->makeOrder(['status' => OrderStatus::SUCCESS]);
        $order->load('items');

        $item = $order->items->first();
        $this->assertNotNull($item, 'Order harus punya item');

        $key  = ProductKey::create([
            'product_id'          => $item->product_id,
            'product_duration_id' => $item->product_duration_id,
            'key_code'            => 'HBO-KEY-001',
            'status'              => 'sold',
        ]);

        $item->orderKeys()->create([
            'product_key_id' => $key->id,
            'key_code'       => 'HBO-KEY-001',
            'expired_at'     => now()->addDays(30),
            'delivered_at'   => now(),
        ]);

        $response = $this->get(route('landing.track.search', ['invoice' => 'INV-TRACKTEST01']));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->has('order.items.0.keys.0')
                 ->where('order.items.0.keys.0.key_code', 'HBO-KEY-001')
        );
    }
}
