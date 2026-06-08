<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Bypass CSRF for test
app()->instance(\App\Http\Middleware\VerifyCsrfToken::class, new class extends \App\Http\Middleware\VerifyCsrfToken {
    protected function tokensMatch($request) { return true; }
});

$product = \App\Models\Product::first();
$duration = $product->durations->first();
$manual = \App\Models\ManualPaymentMethod::first();

$request = Illuminate\Http\Request::create('/checkout', 'POST', [
    'product_id' => $product->id,
    'duration_id' => $duration->id,
    'countryCode' => '+62',
    'whatsapp' => '081234567890',
    'payment_method' => 'manual_' . $manual->id,
    'voucher_code' => '',
    'fields' => [],
]);

$response = app()->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Redirect: " . $response->headers->get('Location') . "\n";
echo "Session whatsapp_url: " . session('whatsapp_url') . "\n";
