<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderKey;
use App\Models\OrderFieldValue;
use App\Models\Product;
use App\Models\ProductKey;
use App\Models\Voucher;
use App\Enums\OrderStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing orders to avoid unique key conflicts
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('orders')->truncate();
        DB::table('order_items')->truncate();
        DB::table('order_keys')->truncate();
        DB::table('order_field_values')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $products = Product::with(['durations', 'fields'])->get();
        $vouchers = Voucher::active()->get();
        
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Please seed products first.');
            return;
        }

        $statuses = [
            OrderStatus::SUCCESS,
            OrderStatus::PAID,
            OrderStatus::UNPAID,
            OrderStatus::FAILED,
            OrderStatus::CANCELED
        ];

        $paymentMethods = ['QRIS', 'VA_BCA', 'VA_BRI', 'VA_MANDIRI', 'OVO', 'DANA', 'ALFAMART'];

        for ($i = 0; $i < 20; $i++) {
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));
            $status = $statuses[array_rand($statuses)];
            
            // Bias towards Success for a better looking dashboard
            if (rand(1, 10) <= 6) {
                $status = OrderStatus::SUCCESS;
            }

            $order = Order::create([
                'customer_name' => fake()->name(),
                'customer_email' => fake()->safeEmail(),
                'whatsapp_number' => '08' . rand(100000000, 999999999),
                'invoice_code' => 'INV-' . strtoupper(\Illuminate\Support\Str::random(12)),
                'status' => $status,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'total_price' => 0, // Will calculate later
                'discount_amount' => 0,
                'is_sent' => $status === OrderStatus::SUCCESS,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $totalPrice = 0;
            $numItems = rand(1, 2);
            $orderProducts = $products->random($numItems > $products->count() ? $products->count() : $numItems);

            foreach ($orderProducts as $product) {
                $duration = $product->durations->random();
                
                $item = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_duration_id' => $duration->id,
                    'product_name' => $product->name,
                    'duration_name' => $duration->name,
                    'price' => $duration->price,
                    'quantity' => 1,
                ]);

                $totalPrice += $duration->price;

                // Create Order Field Values
                foreach ($product->fields as $field) {
                    OrderFieldValue::create([
                        'order_id' => $order->id,
                        'product_field_id' => $field->id,
                        'value' => fake()->word() . (rand(100, 999)),
                    ]);
                }

                // If success, attach a key
                if ($status === OrderStatus::SUCCESS) {
                    $availableKey = ProductKey::where('product_id', $product->id)
                        ->where('product_duration_id', $duration->id)
                        ->where('status', 'available')
                        ->first();

                    if ($availableKey) {
                        $expiredAt = null;
                        if ($duration->duration_days > 0) {
                            $expiredAt = $createdAt->copy()->addDays($duration->duration_days);
                        }

                        OrderKey::create([
                            'order_item_id'  => $item->id,
                            'product_key_id' => $availableKey->id,
                            'key_code'       => $availableKey->key_code,
                            'expired_at'     => $expiredAt,
                            'delivered_at'   => $createdAt,
                        ]);
                        $availableKey->update([
                            'status'     => 'sold',
                            'expires_at' => $expiredAt,
                        ]);
                    }
                }
            }

            // Apply random voucher
            $discount = 0;
            if (rand(1, 5) === 1 && $vouchers->isNotEmpty()) {
                $voucher = $vouchers->random();
                if ($totalPrice >= $voucher->min_transaction) {
                    $discount = $voucher->type === 'fixed' ? $voucher->value : ($totalPrice * $voucher->value / 100);
                    $order->update([
                        'voucher_id' => $voucher->id,
                        'discount_amount' => $discount,
                    ]);
                    $voucher->increment('used');
                }
            }

            $order->update(['total_price' => $totalPrice - $discount]);
        }

        $this->command->info('Successfully seeded 20 orders.');
    }
}
