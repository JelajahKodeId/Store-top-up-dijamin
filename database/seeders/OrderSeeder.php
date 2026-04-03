<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\PaymentMethod;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $paymentMethods = PaymentMethod::all();
        $members = User::role('member')->get();
        
        if ($products->isEmpty() || $paymentMethods->isEmpty()) {
            return;
        }

        $count = 100; // Reduced count for seeding
        
        for ($i = 0; $i < $count; $i++) {
            $product = $products->random();
            $category = $product->category;
            $paymentMethod = $paymentMethods->random();
            
            $isMember = !$members->isEmpty() && rand(0, 1) === 1;
            $user = $isMember ? $members->random() : null;
            
            $status = $this->getRandomStatus();
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));
            
            // Populate extra_data based on category fields
            $extraData = [];
            if ($category->fields) {
                foreach ($category->fields as $field) {
                    $extraData[$field['name']] = match ($field['name']) {
                        'target_id' => (string)rand(1000000, 9999999),
                        'zone_id' => (string)rand(1000, 9999),
                        'username' => 'user_' . Str::random(5),
                        'password' => Str::random(10),
                        'login_via' => ['Moonton', 'FB', 'Google'][rand(0, 2)],
                        'email' => Str::random(8) . '@example.com',
                        'target_url' => 'https://v-k.com/p/' . Str::random(10),
                        default => Str::random(5),
                    };
                }
            }

            Order::create([
                'trx_id' => 'TRX' . strtoupper(Str::random(12)),
                'user_id' => $user?->id,
                'product_id' => $product->id,
                'target_id' => $extraData['target_id'] ?? $extraData['username'] ?? $extraData['email'] ?? $extraData['target_url'] ?? 'N/A',
                'zone_id' => $extraData['zone_id'] ?? null,
                'total_price' => $product->price,
                'status' => $status,
                'payment_method_id' => $paymentMethod->id,
                'reference' => 'REF' . strtoupper(Str::random(8)),
                'customer_name' => $user ? null : 'Guest ' . Str::random(5),
                'customer_email' => $user ? null : 'guest_' . Str::random(5) . '@example.com',
                'extra_data' => $extraData,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }

    private function getRandomStatus(): string
    {
        $rand = rand(1, 100);
        if ($rand <= 80) return 'success';
        if ($rand <= 90) return 'failed';
        if ($rand <= 95) return 'unpaid';
        return 'canceled';
    }
}
