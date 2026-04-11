<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp — gateway Node (wa-server/)
    |--------------------------------------------------------------------------
    | Scan QR di Admin → WhatsApp. WA_SERVER_URL harus reachable dari PHP.
    | Production: WHATSAPP_SERVER_SECRET wajib; URL HTTP hanya ke localhost / IP privat (lihat WhatsAppGateway).
    */
    'whatsapp' => [
        'server_url' => env('WA_SERVER_URL', ''),
        'server_secret' => env('WHATSAPP_SERVER_SECRET'),
        'admin_number' => env('WA_ADMIN_NUMBER'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Notification Toggle
    |--------------------------------------------------------------------------
    | Set EMAIL_NOTIFICATIONS_ENABLED=true di .env untuk mengaktifkan email.
    | Saat ini dimatikan — hanya WhatsApp yang digunakan untuk notifikasi.
    */
    'email_notifications_enabled' => env('EMAIL_NOTIFICATIONS_ENABLED', false),

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'tripay' => [
        'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
        'mode' => env('TRIPAY_MODE', 'sandbox'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment — driver: midtrans (default), tripay, atau mock implisit tanpa kunci
    |--------------------------------------------------------------------------
    */
    'payment' => [
        'driver' => env('PAYMENT_GATEWAY', 'midtrans'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        /*
         * false = API + Snap sandbox (uji transaksi).
         * true = production — hanya setelah go-live dan kunci production.
         */
        'is_production' => filter_var(env('MIDTRANS_IS_PRODUCTION', false), FILTER_VALIDATE_BOOLEAN),
        /*
         * Izinkan MIDTRANS_IS_PRODUCTION=true saat APP_ENV=local (default: tidak).
         * Hanya aktifkan jika Anda sengaja menguji hit production dari mesin lokal.
         */
        'allow_production_in_local' => filter_var(env('MIDTRANS_ALLOW_PRODUCTION_IN_LOCAL', false), FILTER_VALIDATE_BOOLEAN),
    ],

    'pak_kasir' => [
        'api_key' => env('PAK_KASIR_API_KEY'),
        'slug' => env('PAK_KASIR_SLUG'),
        'mode' => env('PAK_KASIR_MODE', 'sandbox'),
    ],

];
