<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$amount = 15000;
$orderId = 'TEST-'.time();
$slug = config('services.pak_kasir.slug');
$apiKey = config('services.pak_kasir.api_key');

$baseUrl = 'https://app.pakasir.com/api';
$method = 'qris';

$payload = [
    'project' => $slug,
    'order_id' => $orderId,
    'amount' => $amount,
    'api_key' => $apiKey,
];

$response = \Illuminate\Support\Facades\Http::asJson()->timeout(30)->post("{$baseUrl}/transactioncreate/{$method}", $payload);
echo json_encode($response->json(), JSON_PRETTY_PRINT);
