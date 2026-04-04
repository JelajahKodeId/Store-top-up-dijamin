<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;

Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/catalog', [LandingController::class, 'catalog'])->name('catalog');
Route::get('/products/{slug}', [LandingController::class, 'show'])->name('products.show.public');
Route::get('/track-invoice', [LandingController::class, 'trackInvoice'])->name('track-invoice');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'admin'])
        ->middleware('role:admin')
        ->name('admin.dashboard');

    Route::prefix('admin')->middleware('role:admin')->name('admin.')->group(function () {
        Route::resource('users', App\Http\Controllers\Admin\UserController::class);
        Route::resource('products', App\Http\Controllers\Admin\ProductController::class);
        Route::get('products/{product}/keys', [App\Http\Controllers\Admin\ProductKeyController::class, 'index'])->name('products.keys.index');
        Route::post('products/{product}/keys', [App\Http\Controllers\Admin\ProductKeyController::class, 'store'])->name('products.keys.store');
        Route::delete('product-keys/{key}', [App\Http\Controllers\Admin\ProductKeyController::class, 'destroy'])->name('products.keys.destroy');
        Route::resource('vouchers', App\Http\Controllers\Admin\VoucherController::class);
        Route::resource('banners', App\Http\Controllers\Admin\BannerController::class);
        Route::get('settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');
        Route::resource('orders', App\Http\Controllers\Admin\OrderController::class)->only(['index', 'show', 'update']);
    });

    Route::get('/dashboard', [DashboardController::class, 'member'])
        ->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
