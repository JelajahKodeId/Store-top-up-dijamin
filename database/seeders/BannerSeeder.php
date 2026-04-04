<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Banner::create([
            'title' => 'Promo Ramadhan',
            'image_url' => 'banners/promo-1.jpg',
            'order_index' => 1,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'Diskon Pembelian Pertama',
            'image_url' => 'banners/promo-2.jpg',
            'order_index' => 2,
            'is_active' => true,
        ]);
    }
}
