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
    public function run(): void
    {
        $products = [
            // ─────────────────────────────────────────────────────────
            // GBOX — External gaming tool dengan binding HWID
            // ─────────────────────────────────────────────────────────
            [
                'name' => 'GBOX',
                'slug' => 'gbox',
                'description' => '<p><strong>GBOX</strong> adalah external gaming tool premium yang memberikan keuntungan kompetitif dalam game favorit kamu.</p><ul><li>✅ Auto-update otomatis</li><li>✅ Bypass anti-cheat terbaru</li><li>✅ Dukungan 24/7 via Discord</li><li>✅ License binding ke HWID</li></ul>',
                'image' => 'https://placehold.co/600x800/0a0a0a/00ff88?text=GBOX',
                'fields' => [
                    [
                        'name' => 'hwid',
                        'label' => 'HWID (Hardware ID)',
                        'type' => 'text',
                        'placeholder' => 'Contoh: A1B2C3D4E5F6-78901234',
                        'validation' => 'required|string|min:10|max:100',
                        'is_required' => true,
                        'sort_order' => 1,
                    ],
                ],
                'durations' => [
                    ['name' => '1 Hari (Trial)',    'duration_days' => 1,  'price' => 15000,  'keys_count' => 10],
                    ['name' => '7 Hari (Weekly)',   'duration_days' => 7,  'price' => 65000,  'keys_count' => 15],
                    ['name' => '30 Hari (Monthly)', 'duration_days' => 30, 'price' => 200000, 'keys_count' => 20],
                    ['name' => '90 Hari (Quarterly)', 'duration_days' => 90, 'price' => 500000, 'keys_count' => 10],
                ],
            ],

            // ─────────────────────────────────────────────────────────
            // DRIP CLIENT — Private game client dengan lisensi per perangkat
            // ─────────────────────────────────────────────────────────
            [
                'name' => 'DRIP CLIENT',
                'slug' => 'drip-client',
                'description' => '<p><strong>DRIP CLIENT</strong> adalah private gaming client eksklusif dengan fitur terlengkap dan undetected rate tertinggi di kelasnya.</p><ul><li>✅ Loader privat — tidak ada di publik</li><li>✅ Support multi-game</li><li>✅ Update harian</li><li>✅ HWID lock per device</li></ul>',
                'image' => 'https://placehold.co/600x800/0a0a0a/7c3aed?text=DRIP+CLIENT',
                'fields' => [
                    [
                        'name' => 'hwid',
                        'label' => 'HWID (Hardware ID)',
                        'type' => 'text',
                        'placeholder' => 'Contoh: B2C3D4E5F6A1-23456789',
                        'validation' => 'required|string|min:10|max:100',
                        'is_required' => true,
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'discord_username',
                        'label' => 'Discord Username',
                        'type' => 'text',
                        'placeholder' => 'Contoh: username#1234',
                        'validation' => 'nullable|string|max:50',
                        'is_required' => false,
                        'sort_order' => 2,
                    ],
                ],
                'durations' => [
                    ['name' => '1 Hari (Trial)',    'duration_days' => 1,  'price' => 20000,  'keys_count' => 8],
                    ['name' => '3 Hari',            'duration_days' => 3,  'price' => 45000,  'keys_count' => 12],
                    ['name' => '7 Hari (Weekly)',   'duration_days' => 7,  'price' => 85000,  'keys_count' => 15],
                    ['name' => '30 Hari (Monthly)', 'duration_days' => 30, 'price' => 250000, 'keys_count' => 20],
                ],
            ],

            // ─────────────────────────────────────────────────────────
            // FLUORITE — Premium gaming software dengan email binding
            // ─────────────────────────────────────────────────────────
            [
                'name' => 'FLUORITE',
                'slug' => 'fluorite',
                'description' => '<p><strong>FLUORITE</strong> adalah premium gaming software generasi terbaru. Dikembangkan oleh tim developer berpengalaman dengan arsitektur kernel-level yang canggih.</p><ul><li>✅ Kernel-level protection bypass</li><li>✅ Stream-proof & screenshot-proof</li><li>✅ Update setiap hari</li><li>✅ Support via ticket system</li></ul>',
                'image' => 'https://placehold.co/600x800/0a0a0a/06b6d4?text=FLUORITE',
                'fields' => [
                    [
                        'name' => 'email',
                        'label' => 'Email Aktivasi',
                        'type' => 'email',
                        'placeholder' => 'email@kamu.com',
                        'validation' => 'required|email|max:150',
                        'is_required' => true,
                        'sort_order' => 1,
                    ],
                ],
                'durations' => [
                    ['name' => '7 Hari (Weekly)',    'duration_days' => 7,   'price' => 75000,   'keys_count' => 15],
                    ['name' => '30 Hari (Monthly)',  'duration_days' => 30,  'price' => 220000,  'keys_count' => 20],
                    ['name' => '90 Hari (Quarterly)', 'duration_days' => 90,  'price' => 550000,  'keys_count' => 10],
                    ['name' => 'Lifetime',           'duration_days' => 0,   'price' => 1200000, 'keys_count' => 5],
                ],
            ],
        ];

        foreach ($products as $pData) {
            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                [
                    'name' => $pData['name'],
                    'description' => $pData['description'],
                    'image' => $pData['image'],
                    'telegram_group_invite_url' => $pData['telegram_group_invite_url'] ?? null,
                    'status' => 'active',
                ]
            );

            // Hapus fields lama lalu buat ulang
            $product->fields()->delete();
            foreach ($pData['fields'] as $fData) {
                ProductField::create(array_merge($fData, ['product_id' => $product->id]));
            }

            foreach ($pData['durations'] as $dData) {
                $keysCount = $dData['keys_count'];
                unset($dData['keys_count']);

                $duration = ProductDuration::updateOrCreate(
                    ['product_id' => $product->id, 'name' => $dData['name']],
                    array_merge($dData, ['product_id' => $product->id, 'is_active' => true])
                );

                // Buat key stok awal (hanya jika belum ada)
                $existingCount = ProductKey::where('product_duration_id', $duration->id)
                    ->where('status', 'available')
                    ->count();

                $toCreate = $keysCount - $existingCount;
                for ($i = 0; $i < $toCreate; $i++) {
                    $prefix = match ($product->slug) {
                        'gbox' => 'GBOX',
                        'drip-client' => 'DRIP',
                        'fluorite' => 'FLUO',
                        default => 'KEY',
                    };

                    // Format: GBOX-XXXX-XXXX-XXXX-XXXX
                    $keyCode = $prefix.'-'
                        .strtoupper(Str::random(4)).'-'
                        .strtoupper(Str::random(4)).'-'
                        .strtoupper(Str::random(4)).'-'
                        .strtoupper(Str::random(4));

                    ProductKey::create([
                        'product_id' => $product->id,
                        'product_duration_id' => $duration->id,
                        'key_code' => $keyCode,
                        'status' => 'available',
                    ]);
                }
            }

            $this->command->info("✅ Produk [{$product->name}] selesai di-seed.");
        }
    }
}
