<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Voucher::create([
            'code' => 'HEMATPISAN',
            'type' => 'fixed',
            'value' => 5000,
            'min_transaction' => 20000,
            'quota' => 100,
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'PROMODI JAMIN',
            'type' => 'percent',
            'value' => 10,
            'min_transaction' => 50000,
            'quota' => 50,
            'is_active' => true,
        ]);
    }
}
