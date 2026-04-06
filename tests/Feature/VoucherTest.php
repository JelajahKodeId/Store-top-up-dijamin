<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use App\Models\Voucher;
use App\Services\Payment\MockPaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoucherTest extends TestCase
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
            'name'   => 'Disney Plus',
            'slug'   => 'disney-plus',
            'status' => 'active',
        ]);

        $this->duration = ProductDuration::create([
            'product_id'    => $this->product->id,
            'name'          => '1 Bulan',
            'duration_days' => 30,
            'price'         => 60000,
            'is_active'     => true,
        ]);

        ProductKey::create([
            'product_id'          => $this->product->id,
            'product_duration_id' => $this->duration->id,
            'key_code'            => 'DISNEY-KEY-001',
            'status'              => 'available',
        ]);
    }

    private function checkout(array $extra = []): \Illuminate\Testing\TestResponse
    {
        return $this->post(route('checkout.store'), array_merge([
            'product_id'  => $this->product->id,
            'duration_id' => $this->duration->id,
            'whatsapp'    => '081234567890',
        ], $extra));
    }

    public function test_fixed_voucher_reduces_price_correctly(): void
    {
        Voucher::create([
            'code'      => 'HEMAT20K',
            'type'      => 'fixed',
            'value'     => 20000,
            'is_active' => true,
        ]);

        $this->checkout(['voucher_code' => 'HEMAT20K']);

        $order = Order::first();
        $this->assertEquals(20000, $order->discount_amount);
        $this->assertEquals(40000, $order->total_price);
    }

    public function test_percent_voucher_reduces_price_correctly(): void
    {
        Voucher::create([
            'code'      => 'DISKON10P',
            'type'      => 'percent',
            'value'     => 10,
            'is_active' => true,
        ]);

        $this->checkout(['voucher_code' => 'DISKON10P']);

        $order = Order::first();
        $this->assertEquals(6000, $order->discount_amount);
        $this->assertEquals(54000, $order->total_price);
    }

    public function test_voucher_below_minimum_transaction_is_rejected(): void
    {
        Voucher::create([
            'code'            => 'MIN100K',
            'type'            => 'fixed',
            'value'           => 10000,
            'min_transaction' => 100000,
            'is_active'       => true,
        ]);

        $response = $this->checkout(['voucher_code' => 'MIN100K']);
        $response->assertSessionHasErrors('voucher_code');
    }

    public function test_voucher_with_exhausted_quota_is_rejected(): void
    {
        Voucher::create([
            'code'      => 'HABIS',
            'type'      => 'fixed',
            'value'     => 5000,
            'quota'     => 5,
            'used'      => 5,
            'is_active' => true,
        ]);

        $response = $this->checkout(['voucher_code' => 'HABIS']);
        $response->assertSessionHasErrors('voucher_code');
    }

    public function test_inactive_voucher_is_rejected(): void
    {
        Voucher::create([
            'code'      => 'NONAKTIF',
            'type'      => 'fixed',
            'value'     => 5000,
            'is_active' => false,
        ]);

        $response = $this->checkout(['voucher_code' => 'NONAKTIF']);
        $response->assertSessionHasErrors('voucher_code');
    }

    public function test_discount_cannot_exceed_total_price(): void
    {
        Voucher::create([
            'code'      => 'BESAR',
            'type'      => 'fixed',
            'value'     => 999999,
            'is_active' => true,
        ]);

        $this->checkout(['voucher_code' => 'BESAR']);

        $order = Order::first();
        $this->assertEquals(60000, $order->discount_amount);
        $this->assertEquals(0, $order->total_price);
    }
}
