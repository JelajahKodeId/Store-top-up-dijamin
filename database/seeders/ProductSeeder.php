<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductField;
use App\Models\ProductKey;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Cheat MLBB - External VIP',
                'description' => 'Cheat Mobile Legends External VIP dengan fitur Radar, Auto Retri, dan Unlock Emblem.',
                'fields' => [
                    ['name' => 'user_id', 'label' => 'User ID', 'type' => 'number', 'placeholder' => '12345678', 'is_required' => true, 'sort_order' => 1],
                    ['name' => 'server_id', 'label' => 'Server ID', 'type' => 'number', 'placeholder' => '1234', 'is_required' => true, 'sort_order' => 2],
                ],
                'durations' => [
                    ['name' => '1 Hari (Trial)', 'duration_days' => 1, 'price' => 10000],
                    ['name' => '3 Hari (Weekend)', 'duration_days' => 3, 'price' => 25000],
                    ['name' => '7 Hari (Weekly)', 'duration_days' => 7, 'price' => 50000],
                ]
            ],
            [
                'name' => 'Spotify Premium - Shared Account',
                'description' => 'Akses Spotify Premium via akun sharing. Legal dan anti-on hold.',
                'fields' => [
                    ['name' => 'email_request', 'label' => 'Email (Optional for Request)', 'type' => 'text', 'placeholder' => 'example@gmail.com', 'is_required' => false, 'sort_order' => 1],
                ],
                'durations' => [
                    ['name' => '30 Hari', 'duration_days' => 30, 'price' => 15000],
                    ['name' => '90 Hari', 'duration_days' => 90, 'price' => 40000],
                ]
            ],
            [
                'name' => 'Netflix Premium - 1 Profile License',
                'description' => 'Lisensi akses 1 profil Netflix Premium 4K UHD.',
                'fields' => [
                    ['name' => 'profile_name', 'label' => 'Nama Profil', 'type' => 'text', 'placeholder' => 'MyNetlix', 'is_required' => true, 'sort_order' => 1],
                ],
                'durations' => [
                    ['name' => '30 Hari', 'duration_days' => 30, 'price' => 35000],
                ]
            ]
        ];

        foreach ($products as $pData) {
            $product = Product::create([
                'name' => $pData['name'],
                'slug' => Str::slug($pData['name']),
                'description' => $pData['description'],
                'status' => 'active',
                'image' => 'https://placehold.co/600x400?text=' . urlencode($pData['name']),
            ]);

            foreach ($pData['fields'] as $fData) {
                ProductField::create(array_merge($fData, ['product_id' => $product->id]));
            }

            foreach ($pData['durations'] as $dData) {
                $duration = ProductDuration::create(array_merge($dData, [
                    'product_id' => $product->id,
                    'is_active' => true,
                ]));

                // Create some available keys for each duration
                for ($i = 1; $i <= 5; $i++) {
                    ProductKey::create([
                        'product_id' => $product->id,
                        'product_duration_id' => $duration->id,
                        'key_code' => 'KEY-' . strtoupper(Str::random(12)),
                        'status' => 'available',
                    ]);
                }
            }
        }
    }
}
