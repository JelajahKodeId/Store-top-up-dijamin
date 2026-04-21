<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MemberTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            ['id' => 'standard', 'name' => 'Member', 'level' => 0, 'price' => null, 'is_active' => true],
            ['id' => 'reseller', 'name' => 'Reseller', 'level' => 1, 'price' => 500000.00, 'is_active' => true],
            ['id' => 'vip', 'name' => 'VIP', 'level' => 2, 'price' => 1000000.00, 'is_active' => true],
        ];

        foreach ($tiers as $tier) {
            \App\Models\MemberTier::firstOrCreate(['id' => $tier['id']], $tier);
        }
    }
}
