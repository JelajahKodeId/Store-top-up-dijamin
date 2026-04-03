<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mobile Legends',
                'description' => 'Top up Diamond Mobile Legends: Bang Bang secara instan dan aman.',
                'image_url' => 'https://via.placeholder.com/150?text=MLBB',
                'fields' => [
                    ['name' => 'target_id', 'label' => 'User ID', 'placeholder' => 'Masukkan User ID'],
                    ['name' => 'zone_id', 'label' => 'Zone ID', 'placeholder' => 'Masukkan Zone ID'],
                ],
            ],
            [
                'name' => 'Free Fire',
                'description' => 'Beli Diamond Free Fire murah dan terpercaya.',
                'image_url' => 'https://via.placeholder.com/150?text=FF',
                'fields' => [
                    ['name' => 'target_id', 'label' => 'User ID / Player ID', 'placeholder' => 'Masukkan Player ID'],
                ],
            ],
            [
                'name' => 'PUBG Mobile',
                'description' => 'Isi ulang UC PUBG Mobile dalam hitungan detik.',
                'image_url' => 'https://via.placeholder.com/150?text=PUBGM',
                'fields' => [
                    ['name' => 'target_id', 'label' => 'User ID', 'placeholder' => 'Masukkan User ID'],
                ],
            ],
            [
                'name' => 'Joki MLBB',
                'description' => 'Layanan Joki Rank Mobile Legends profesional dan cepat.',
                'image_url' => 'https://via.placeholder.com/150?text=Joki+MLBB',
                'fields' => [
                    ['name' => 'username', 'label' => 'Username/Email', 'placeholder' => 'Masukkan Username/Email'],
                    ['name' => 'password', 'label' => 'Password', 'placeholder' => 'Masukkan Password'],
                    ['name' => 'login_via', 'label' => 'Login Via', 'placeholder' => 'Contoh: Moonton, FB, Google'],
                ],
            ],
            [
                'name' => 'VPN Premium',
                'description' => 'Langganan VPN Premium (ExpressVPN, Surfshark) murah.',
                'image_url' => 'https://via.placeholder.com/150?text=VPN',
                'fields' => [
                    ['name' => 'email', 'label' => 'Email', 'placeholder' => 'Email untuk pengiriman akun'],
                ],
            ],
            [
                'name' => 'Layanan Sosmed',
                'description' => 'Followers, Likes, dan Viewers untuk Instagram, TikTok, dan YouTube.',
                'image_url' => 'https://via.placeholder.com/150?text=Sosmed',
                'fields' => [
                    ['name' => 'target_url', 'label' => 'Link Profil/Post', 'placeholder' => 'Masukkan Link lengkap'],
                ],
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'image_url' => $category['image_url'],
                    'fields' => $category['fields'],
                    'is_active' => true,
                ]
            );
        }
    }
}
