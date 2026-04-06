<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarkExpiredKeysTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    private function makeKey(string $status, ?\DateTime $expiresAt = null): ProductKey
    {
        $product  = Product::firstOrCreate(
            ['slug' => 'test-product'],
            ['name' => 'Test Product', 'status' => 'active']
        );
        $duration = ProductDuration::firstOrCreate(
            ['product_id' => $product->id, 'name' => '30 Hari'],
            ['duration_days' => 30, 'price' => 10000, 'is_active' => true]
        );

        return ProductKey::create([
            'product_id'          => $product->id,
            'product_duration_id' => $duration->id,
            'key_code'            => 'KEY-' . uniqid(),
            'status'              => $status,
            'expires_at'          => $expiresAt,
        ]);
    }

    public function test_command_marks_sold_keys_past_expires_at_as_expired(): void
    {
        $expiredKey = $this->makeKey('sold', now()->subDays(1));
        $activeKey  = $this->makeKey('sold', now()->addDays(10));
        $availKey   = $this->makeKey('available', now()->subDays(5));

        $this->artisan('keys:mark-expired')->assertSuccessful();

        $this->assertEquals('expired', $expiredKey->fresh()->status);
        $this->assertEquals('sold', $activeKey->fresh()->status);
        $this->assertEquals('available', $availKey->fresh()->status);
    }

    public function test_command_does_not_affect_permanent_keys(): void
    {
        $permanentKey = $this->makeKey('sold', null);

        $this->artisan('keys:mark-expired')->assertSuccessful();

        $this->assertEquals('sold', $permanentKey->fresh()->status);
    }
}
