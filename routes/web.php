<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductKeyController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Admin\WhatsAppGatewayController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebhookController;
use App\Models\Order;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Public Guest Routes ─────────────────────────────────────────────────────
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/catalog', [LandingController::class, 'catalog'])->name('catalog');
Route::get('/products/{slug}', [LandingController::class, 'show'])->name('products.show.public');
Route::get('/track-invoice', [LandingController::class, 'trackInvoice'])->name('track-invoice');
Route::get('/track-invoice/search', [LandingController::class, 'trackInvoiceSearch'])
    ->middleware('throttle:10,1')
    ->name('landing.track.search');
Route::get('/orders/{invoice}', [LandingController::class, 'orderStatus'])->name('orders.status');

Route::post('/checkout', [CheckoutController::class, 'store'])
    ->middleware('throttle:checkout')
    ->name('checkout.store');

// Cek validitas voucher + preview diskon (tanpa checkout)
Route::post('/vouchers/check', function (Request $request) {
    $request->validate([
        'code' => ['required', 'string', 'max:50'],
        'price' => ['required', 'numeric', 'min:0'],
    ]);

    $voucher = Voucher::active()
        ->where('code', strtoupper(trim($request->code)))
        ->first();

    if (! $voucher) {
        return response()->json([
            'valid' => false,
            'message' => 'Voucher tidak valid atau sudah kadaluarsa.',
        ]);
    }

    $price = (float) $request->price;

    if ($voucher->min_transaction && $price < $voucher->min_transaction) {
        return response()->json([
            'valid' => false,
            'message' => 'Minimum transaksi Rp '.number_format($voucher->min_transaction, 0, ',', '.'),
        ]);
    }

    $discountAmount = $voucher->type === 'percent'
        ? ($price * (float) $voucher->value / 100)
        : (float) $voucher->value;

    $discountAmount = min($discountAmount, $price);
    $finalPrice = max(0, $price - $discountAmount);

    $label = $voucher->type === 'percent'
        ? "Diskon {$voucher->value}%"
        : 'Diskon Rp '.number_format($discountAmount, 0, ',', '.');

    return response()->json([
        'valid' => true,
        'type' => $voucher->type,
        'value' => (float) $voucher->value,
        'discount_amount' => $discountAmount,
        'final_price' => $finalPrice,
        'label' => $label,
        'message' => $label.' berhasil diterapkan!',
    ]);
})->name('vouchers.check')->middleware('throttle:30,1');

// ── Webhook Payment Gateway ─────────────────────────────────────────────────
// CSRF dikecualikan via bootstrap/app.php (path /webhooks/*)
Route::post('/webhooks/payment', [WebhookController::class, 'handle'])
    ->middleware('throttle:60,1')
    ->name('webhooks.payment');

// Mock webhook untuk testing di lokal (hanya aktif di env local/testing)
Route::get('/webhooks/mock/{invoice_code}', [WebhookController::class, 'mock'])
    ->name('webhooks.mock');

// Mock payment page — halaman simulasi bayar (development only)
Route::get('/mock-payment/{reference}', function (string $reference) {
    abort_unless(app()->environment(['local', 'testing']), 404);

    // Ekstrak invoice code dari reference (hapus prefix MOCK-)
    $invoiceCode = preg_replace('/^MOCK-/i', '', $reference);
    $order = Order::where('invoice_code', $invoiceCode)
        ->with('items')
        ->first();

    if (! $order) {
        abort(404, 'Order tidak ditemukan untuk referensi ini.');
    }

    return view('mock-payment', [
        'order' => $order,
        'invoiceCode' => $invoiceCode,
        'reference' => $reference,
    ]);
})->name('mock.payment');

// ── Admin Panel ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');

    // Profile (di dalam admin panel) — hapus akun dinonaktifkan untuk admin
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Resources — dibatasi hanya pada method yang benar-benar tersedia di controller
    Route::resource('users', UserController::class)
        ->only(['index', 'show', 'store', 'update', 'destroy']);

    Route::resource('products', ProductController::class);

    Route::get('products/{product}/keys', [ProductKeyController::class, 'index'])
        ->name('products.keys.index');
    Route::post('products/{product}/keys', [ProductKeyController::class, 'store'])
        ->name('products.keys.store');
    Route::delete('product-keys/{key}', [ProductKeyController::class, 'destroy'])
        ->name('products.keys.destroy');

    Route::resource('vouchers', VoucherController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('banners', BannerController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('whatsapp', [WhatsAppGatewayController::class, 'index'])->name('whatsapp.index');
    Route::get('whatsapp/status', [WhatsAppGatewayController::class, 'status'])->name('whatsapp.status');
    Route::post('whatsapp/logout', [WhatsAppGatewayController::class, 'logoutSession'])->name('whatsapp.logout');
    Route::post('whatsapp/send-test', [WhatsAppGatewayController::class, 'sendTest'])->name('whatsapp.send-test');

    Route::resource('orders', OrderController::class)
        ->only(['index', 'show', 'update']);
});

// ── Authenticated (member + admin) ──────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {
    // Member dashboard — DashboardController@member menangani redirect ke admin jika role admin
    Route::get('/dashboard', [DashboardController::class, 'member'])->name('dashboard');
});

require __DIR__.'/auth.php';
