<?php
namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name', 'value' => 'Store Top Up', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Platform Top Up Game Terpercaya dan Tercepat di Indonesia.', 'group' => 'general'],
            ['key' => 'site_keywords', 'value' => 'topup game, diamonds ml, uc pubg, voucher game', 'group' => 'general'],
            
            // Branding
            ['key' => 'logo_web', 'value' => null, 'group' => 'branding'],
            ['key' => 'logo_footer', 'value' => null, 'group' => 'branding'],
            ['key' => 'favicon', 'value' => null, 'group' => 'branding'],
            
            // Social Media
            ['key' => 'whatsapp_number', 'value' => '628123456789', 'group' => 'social'],
            ['key' => 'instagram_username', 'value' => 'store_topup', 'group' => 'social'],
            ['key' => 'facebook_page', 'value' => 'Store Top Up Official', 'group' => 'social'],
            ['key' => 'tiktok_username', 'value' => '@store_topup', 'group' => 'social'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'support@store.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '021-1234567', 'group' => 'contact'],
            ['key' => 'address', 'value' => 'Jakarta, Indonesia', 'group' => 'contact'],
            
            // Announcement
            ['key' => 'announcement', 'value' => 'Selamat datang di Store Top Up! Nikmati promo menarik setiap harinya.', 'group' => 'announcement'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], ['value' => $setting['value'], 'group' => $setting['group']]);
        }
    }
}
