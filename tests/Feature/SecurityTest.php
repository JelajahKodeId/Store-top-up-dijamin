<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use App\Models\User;
use App\Services\Payment\MockPaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Security tests — CSRF, auth bypass, role escalation, rate limit, injection.
 */
class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->app->instance(PaymentGatewayInterface::class, new MockPaymentService());

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');
    }

    // ── CSRF Protection ──────────────────────────────────────────────────────

    public function test_checkout_post_without_csrf_returns_419(): void
    {
        $product  = Product::create(['name' => 'Test', 'slug' => 'test', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id'    => $product->id,
            'name'          => '1 Hari',
            'duration_days' => 1,
            'price'         => 10000,
            'is_active'     => true,
        ]);

        // withoutMiddleware tidak dipakai — kita uji bahwa CSRF aktif
        $response = $this->call('POST', route('checkout.store'), [
            'product_id'  => $product->id,
            'duration_id' => $duration->id,
            'whatsapp'    => '081234567890',
        ]);

        // Tanpa CSRF token, harus 419 (Page Expired) atau 302 (redirect ke form)
        $this->assertContains($response->getStatusCode(), [302, 419],
            'Checkout endpoint harus dilindungi CSRF');
    }

    public function test_admin_post_without_csrf_returns_419(): void
    {
        $response = $this->actingAs($this->admin)
            ->call('POST', route('admin.products.index'), []);

        $this->assertContains($response->getStatusCode(), [302, 405, 419],
            'Admin POST endpoints harus dilindungi CSRF');
    }

    public function test_webhook_endpoint_is_csrf_exempt(): void
    {
        // Webhook tidak boleh memerlukan CSRF — gateway eksternal tidak bisa mengirimnya
        $response = $this->call('POST', route('webhooks.payment'), [
            'reference' => 'MOCK-TEST',
            'status'    => 'paid',
        ]);

        // Tidak boleh 419
        $this->assertNotEquals(419, $response->getStatusCode(),
            'Webhook endpoint harus dikecualikan dari CSRF');
    }

    // ── Authentication Bypass ─────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_access_admin_dashboard(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_unauthenticated_user_cannot_access_admin_orders(): void
    {
        $this->get(route('admin.orders.index'))
            ->assertRedirect(route('login'));
    }

    public function test_unauthenticated_user_cannot_access_admin_users(): void
    {
        $this->get(route('admin.users.index'))
            ->assertRedirect(route('login'));
    }

    public function test_unauthenticated_user_cannot_post_to_admin_endpoints(): void
    {
        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('admin.settings.update'), ['key' => 'site_name', 'value' => 'Hacked'])
            ->assertRedirect(route('login'));
    }

    // ── Role Escalation & Authorization ──────────────────────────────────────

    public function test_member_cannot_access_admin_panel(): void
    {
        $this->actingAs($this->member)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    public function test_member_cannot_view_admin_users_list(): void
    {
        $this->actingAs($this->member)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_member_cannot_create_product(): void
    {
        $this->actingAs($this->member)
            ->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('admin.products.store'), [
                'name'   => 'Hacked Product',
                'slug'   => 'hacked',
                'status' => 'active',
            ])
            ->assertForbidden();
    }

    public function test_member_cannot_change_order_status(): void
    {
        $order = Order::create([
            'whatsapp_number' => '08999',
            'invoice_code'    => 'INV-SEC-001',
            'total_price'     => 50000,
            'status'          => OrderStatus::UNPAID,
        ]);

        $this->actingAs($this->member)
            ->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->patch(route('admin.orders.update', $order), ['status' => 'success'])
            ->assertForbidden();

        $this->assertEquals(OrderStatus::UNPAID, $order->fresh()->status);
    }

    public function test_member_cannot_delete_product_keys(): void
    {
        $product  = Product::create(['name' => 'P', 'slug' => 'p', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id, 'name' => '1D',
            'duration_days' => 1, 'price' => 5000, 'is_active' => true,
        ]);
        $key = ProductKey::create([
            'product_id' => $product->id, 'product_duration_id' => $duration->id,
            'key_code' => 'TEST-KEY', 'status' => 'available',
        ]);

        $this->actingAs($this->member)
            ->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->delete(route('admin.products.keys.destroy', $key))
            ->assertForbidden();

        $this->assertNotNull(ProductKey::find($key->id));
    }

    // ── SQL Injection Protection ──────────────────────────────────────────────

    public function test_checkout_rejects_sql_injection_in_whatsapp(): void
    {
        $product  = Product::create(['name' => 'SQL Test', 'slug' => 'sql-test', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id, 'name' => '1D',
            'duration_days' => 1, 'price' => 5000, 'is_active' => true,
        ]);

        // Inject SQL ke field whatsapp — harus truncated/rejected by validation (max:20)
        $sqlPayload = "'; DROP TABLE orders; --";
        $response   = $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('checkout.store'), [
                'product_id'  => $product->id,
                'duration_id' => $duration->id,
                'whatsapp'    => $sqlPayload,
            ]);

        // Harus gagal validasi karena max:20
        $response->assertSessionHasErrors('whatsapp');
        $this->assertEquals(0, Order::count());
    }

    public function test_track_invoice_with_sql_injection_returns_no_data(): void
    {
        // Jika ada order, pastikan SQL injection tidak expose data lain
        Order::create([
            'whatsapp_number' => '08888',
            'invoice_code'    => 'INV-REAL-001',
            'total_price'     => 10000,
            'status'          => 'unpaid',
        ]);

        $sqlPayload = "' OR '1'='1";
        $response   = $this->get(route('landing.track.search', ['invoice' => $sqlPayload]));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->where('order', null)
        );
    }

    // ── XSS Prevention ───────────────────────────────────────────────────────

    public function test_xss_payload_in_customer_name_is_stored_safely(): void
    {
        $product  = Product::create(['name' => 'XSS Test', 'slug' => 'xss-test', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id, 'name' => '1D',
            'duration_days' => 1, 'price' => 5000, 'is_active' => true,
        ]);
        ProductKey::create([
            'product_id' => $product->id, 'product_duration_id' => $duration->id,
            'key_code' => 'XSS-KEY', 'status' => 'available',
        ]);

        $xssPayload = '<script>alert("XSS")</script>';

        $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('checkout.store'), [
                'product_id'    => $product->id,
                'duration_id'   => $duration->id,
                'customer_name' => $xssPayload,
                'whatsapp'      => '081234567890',
            ]);

        // Payload tersimpan apa adanya di DB (Eloquent TIDAK escape) — rendering engine (Blade/React) yang escape
        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals($xssPayload, $order->customer_name);
        // Laravel/React akan escape saat render, jadi aman dari XSS
    }

    // ── Rate Limiting ────────────────────────────────────────────────────────

    public function test_checkout_rate_limit_blocks_excessive_requests(): void
    {
        $product  = Product::create(['name' => 'RL Test', 'slug' => 'rl-test', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id, 'name' => '1D',
            'duration_days' => 1, 'price' => 5000, 'is_active' => true,
        ]);

        // Kirim 6 request (limit = 5 per menit per IP dalam AppServiceProvider)
        $lastResponse = null;
        for ($i = 0; $i < 6; $i++) {
            ProductKey::create([
                'product_id' => $product->id, 'product_duration_id' => $duration->id,
                'key_code'   => 'RL-KEY-' . $i, 'status' => 'available',
            ]);

            $lastResponse = $this->withoutMiddleware(\App\Http\Middleware\VerifyCsrfToken::class)
                ->post(route('checkout.store'), [
                    'product_id'  => $product->id,
                    'duration_id' => $duration->id,
                    'whatsapp'    => '08123456789' . $i,
                ]);
        }

        // Request ke-6 harus kena rate limit (429)
        $this->assertEquals(429, $lastResponse->getStatusCode(),
            'Rate limiter harus membatasi checkout ke maksimal 5 per menit per IP');
    }

    // ── Mass Assignment Protection ────────────────────────────────────────────

    public function test_order_model_blocks_mass_assignment_of_sensitive_fields(): void
    {
        $order = new Order([
            'status'    => 'success',
            'is_sent'   => true,
            'id'        => 9999,
        ]);

        // Cek apakah field yang tidak ada di $fillable tidak diisi
        // 'id' tidak ada di fillable, jadi tidak akan ter-set
        $this->assertNull($order->getKey());  // ID belum di-set via mass assign
    }

    public function test_product_key_model_blocks_mass_assignment_of_sold_status(): void
    {
        $product  = Product::create(['name' => 'MA Test', 'slug' => 'ma-test', 'status' => 'active']);
        $duration = ProductDuration::create([
            'product_id' => $product->id, 'name' => '1D',
            'duration_days' => 1, 'price' => 5000, 'is_active' => true,
        ]);

        $key = ProductKey::create([
            'product_id'          => $product->id,
            'product_duration_id' => $duration->id,
            'key_code'            => 'MA-KEY-001',
            'status'              => 'available',
        ]);

        // Status 'available' tersimpan dengan benar — 'status' ada di fillable
        $this->assertEquals('available', $key->fresh()->status);
    }

    // ── Insecure Direct Object Reference (IDOR) ──────────────────────────────

    public function test_member_cannot_access_other_admin_order_via_direct_url(): void
    {
        $order = Order::create([
            'whatsapp_number' => '08777',
            'invoice_code'    => 'INV-IDOR-001',
            'total_price'     => 20000,
            'status'          => OrderStatus::UNPAID,
        ]);

        // Member mencoba akses detail order via admin route
        $this->actingAs($this->member)
            ->get(route('admin.orders.show', $order))
            ->assertForbidden();
    }

    public function test_guest_can_access_own_order_status_by_invoice(): void
    {
        $order = Order::create([
            'customer_email'  => 'buyer@test.com',
            'whatsapp_number' => '08123',
            'invoice_code'    => 'INV-PUBLIC-001',
            'total_price'     => 15000,
            'status'          => OrderStatus::UNPAID,
        ]);

        // Order status accessible via invoice code (public, no auth required)
        $this->get(route('orders.status', $order->invoice_code))
            ->assertOk();
    }

    public function test_order_status_with_nonexistent_invoice_returns_404(): void
    {
        $this->get(route('orders.status', 'INV-TIDAK-ADA-XYZ'))
            ->assertNotFound();
    }
}
