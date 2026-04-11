<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductReview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductReviewTest extends TestCase
{
    use RefreshDatabase;

    private function seedProduct(string $slug): Product
    {
        return Product::create([
            'name' => 'Test Product',
            'slug' => $slug,
            'description' => null,
            'image' => null,
            'telegram_group_invite_url' => null,
            'status' => 'active',
        ]);
    }

    public function test_review_requires_invoice(): void
    {
        $this->seedProduct('game-x');

        $response = $this->from(route('products.show.public', 'game-x'))
            ->post(route('products.reviews.store', 'game-x'), [
                'author_name' => 'Budi',
                'rating' => 5,
                'body' => 'Isi ulasan minimal sepuluh huruf di sini ya.',
            ]);

        $response->assertSessionHasErrors('invoice_code');
        $this->assertDatabaseCount('product_reviews', 0);
    }

    public function test_verified_invoice_publishes_review(): void
    {
        $product = $this->seedProduct('game-a');
        $duration = ProductDuration::create([
            'product_id' => $product->id,
            'name' => 'Paket A',
            'duration_days' => 30,
            'price' => 50000,
            'is_active' => true,
        ]);

        $order = Order::create([
            'invoice_code' => 'INV-TESTVERIFY01',
            'total_price' => 50000,
            'discount_amount' => 0,
            'status' => OrderStatus::SUCCESS,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_duration_id' => $duration->id,
            'product_name' => $product->name,
            'duration_name' => $duration->name,
            'price' => 50000,
            'quantity' => 1,
        ]);

        $response = $this->from(route('products.show.public', 'game-a'))
            ->post(route('products.reviews.store', 'game-a'), [
                'author_name' => 'Ani',
                'rating' => 4,
                'body' => 'Sudah beli dan key valid, terima kasih banyak ya.',
                'invoice_code' => 'inv-testverify01',
            ]);

        $response->assertRedirect();
        $review = ProductReview::where('product_id', $product->id)->first();
        $this->assertNotNull($review);
        $this->assertTrue($review->verified_purchase);
        $this->assertTrue($review->is_published);
        $this->assertSame('INV-TESTVERIFY01', $review->invoice_code);
    }
}
