<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('dsadsadsa'),
                'phone_number' => '628123456781',
                'balance' => 1000000,
            ]
        );

        $admin->assignRole('admin');

        $member = User::updateOrCreate(
            ['email' => 'member@gmail.com'],
            [
                'name' => 'Regular Member',
                'password' => Hash::make('dsadsadsa'),
                'phone_number' => '628123456782',
                'balance' => 0,
            ]
        );

        $member->assignRole('member');
    }
}
