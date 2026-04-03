<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'name' => 'QRIS',
                'code' => 'QRIS',
                'fee_flat' => 0,
                'fee_percent' => 0.7,
                'is_active' => true,
            ],
            [
                'name' => 'DANA',
                'code' => 'DANA',
                'fee_flat' => 0,
                'fee_percent' => 1.5,
                'is_active' => true,
            ],
            [
                'name' => 'OVO',
                'code' => 'OVO',
                'fee_flat' => 0,
                'fee_percent' => 1.5,
                'is_active' => true,
            ],
            [
                'name' => 'Mandiri Virtual Account',
                'code' => 'MANDIRIVA',
                'fee_flat' => 4000,
                'fee_percent' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(['code' => $method['code']], $method);
        }
    }
}
