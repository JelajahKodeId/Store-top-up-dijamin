<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'store_name', 'value' => 'Store Top-Up Dijamin', 'group' => 'general'],
            ['key' => 'contact_whatsapp', 'value' => '08123456789', 'group' => 'contact'],
            ['key' => 'tripay_api_key', 'value' => 'YOUR_TRIPAY_API_KEY', 'group' => 'api'],
            ['key' => 'tripay_private_key', 'value' => 'YOUR_TRIPAY_PRIVATE_KEY', 'group' => 'api'],
            ['key' => 'digiflazz_username', 'value' => 'YOUR_DIGIFLAZZ_USERNAME', 'group' => 'api'],
            ['key' => 'digiflazz_api_key', 'value' => 'YOUR_DIGIFLAZZ_API_KEY', 'group' => 'api'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
