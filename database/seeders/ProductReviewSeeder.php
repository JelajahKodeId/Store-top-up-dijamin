<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

class ProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['author_name' => 'Raka P.', 'rating' => 5, 'body' => 'Pengiriman instan, key langsung masuk WA. Proses checkout juga jelas.'],
            ['author_name' => 'Maya S.', 'rating' => 4, 'body' => 'Sudah beberapa kali beli di sini, respons CS cepat kalau ada kendala.'],
            ['author_name' => 'Dion W.', 'rating' => 5, 'body' => 'Harga kompetitif dan stok tersedia. Recommended untuk top-up digital.'],
        ];

        $products = Product::where('status', 'active')->orderBy('id')->take(3)->get();

        foreach ($products as $i => $product) {
            if (empty($product->telegram_group_invite_url)) {
                $product->update([
                    'telegram_group_invite_url' => 'https://t.me/joinchat/placeholder-undangan-grup',
                ]);
            }

            foreach ($rows as $j => $row) {
                if (($i + $j) % 2 === 1) {
                    continue;
                }

                $invoice = 'INV-SEED-'.strtoupper(str_replace('-', '', $product->slug)).'-'.($j + 1);

                ProductReview::firstOrCreate(
                    ['invoice_code' => $invoice],
                    [
                        'product_id' => $product->id,
                        'author_name' => $row['author_name'],
                        'rating' => $row['rating'],
                        'body' => $row['body'],
                        'verified_purchase' => true,
                        'is_published' => true,
                    ]
                );
            }
        }
    }
}
