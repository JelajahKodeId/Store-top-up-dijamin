<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mlbb = Category::where('slug', 'mobile-legends')->first();
        if ($mlbb) {
            $nominals = [
                ['n' => 86, 'p' => 20000],
                ['n' => 172, 'p' => 40000],
                ['n' => 257, 'p' => 60000],
                ['n' => 706, 'p' => 160000],
            ];
            foreach ($nominals as $data) {
                Product::updateOrCreate(
                    ['sku' => "MLBB-" . $data['n']],
                    [
                        'category_id' => $mlbb->id,
                        'name' => $data['n'] . ' Diamonds',
                        'price' => $data['p'],
                        'discount_price' => $data['p'] * 0.95,
                        'is_available' => true,
                        'is_active' => true,
                    ]
                );
            }
        }

        $ff = Category::where('slug', 'free-fire')->first();
        if ($ff) {
            $nominals = [
                ['n' => 50, 'p' => 8000],
                ['n' => 100, 'p' => 15000],
                ['n' => 720, 'p' => 100000],
            ];
            foreach ($nominals as $data) {
                Product::updateOrCreate(
                    ['sku' => "FF-" . $data['n']],
                    [
                        'category_id' => $ff->id,
                        'name' => $data['n'] . ' Diamonds',
                        'price' => $data['p'],
                        'discount_price' => $data['p'] * 0.95,
                        'is_available' => true,
                        'is_active' => true,
                    ]
                );
            }
        }

        $joki = Category::where('slug', 'joki-mlbb')->first();
        if ($joki) {
            $services = [
                ['name' => 'Rank Epic ke Legend', 'price' => 150000],
                ['name' => 'Rank Legend ke Mythic', 'price' => 250000],
                ['name' => 'Per Bintang (Mythic)', 'price' => 15000],
            ];
            foreach ($services as $idx => $s) {
                Product::updateOrCreate(
                    ['sku' => "JOKI-ML-" . $idx],
                    [
                        'category_id' => $joki->id,
                        'name' => $s['name'],
                        'price' => $s['price'],
                        'discount_price' => $s['price'] - 5000,
                        'is_available' => true,
                        'is_active' => true,
                    ]
                );
            }
        }

        $vpn = Category::where('slug', 'vpn-premium')->first();
        if ($vpn) {
            $plans = [
                ['name' => 'ExpressVPN 1 Bulan', 'price' => 45000],
                ['name' => 'ExpressVPN 1 Tahun', 'price' => 350000],
                ['name' => 'Surfshark 1 Bulan', 'price' => 30000],
            ];
            foreach ($plans as $idx => $p) {
                Product::updateOrCreate(
                    ['sku' => "VPN-" . $idx],
                    [
                        'category_id' => $vpn->id,
                        'name' => $p['name'],
                        'price' => $p['price'],
                        'discount_price' => $p['price'] - 2000,
                        'is_available' => true,
                        'is_active' => true,
                    ]
                );
            }
        }

        $sosmed = Category::where('slug', 'layanan-sosmed')->first();
        if ($sosmed) {
            $services = [
                ['name' => '1000 Followers Instagram', 'price' => 10000],
                ['name' => '1000 Likes TikTok', 'price' => 5000],
                ['name' => '4000 Jam Tayang YouTube', 'price' => 800000],
            ];
            foreach ($services as $idx => $s) {
                Product::updateOrCreate(
                    ['sku' => "SOSMED-" . $idx],
                    [
                        'category_id' => $sosmed->id,
                        'name' => $s['name'],
                        'price' => $s['price'],
                        'discount_price' => $s['price'] - 1000,
                        'is_available' => true,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
