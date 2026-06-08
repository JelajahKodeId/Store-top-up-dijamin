<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Bypass CSRF
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
$request->headers->set('X-Inertia', 'true');

$response = app()->handle($request);
echo "POST Status: " . $response->getStatusCode() . "\n";
$location = $response->headers->get('Location');
echo "Location: " . $location . "\n";

// Now simulate the GET request
$getRequest = Illuminate\Http\Request::create($location, 'GET');
$getRequest->headers->set('X-Inertia', 'true');

// We must preserve the session
$getRequest->setLaravelSession($request->getSession());
$getResponse = app()->handle($getRequest);

echo "GET Status: " . $getResponse->getStatusCode() . "\n";
$content = json_decode($getResponse->getContent(), true);
echo "Flash WhatsApp URL: " . ($content['props']['flash']['whatsapp_url'] ?? 'NULL') . "\n";
