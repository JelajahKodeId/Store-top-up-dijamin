<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Gunakan TripayService hanya di production; selainnya (local/testing) pakai MockPaymentService
        $this->app->bind(PaymentGatewayInterface::class, function ($app) {
            if ($app->isProduction()) {
                return new \App\Services\Payment\TripayService();
            }
            return new \App\Services\Payment\MockPaymentService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Http\Resources\Json\JsonResource::withoutWrapping();

        Vite::prefetch(concurrency: 3);

        // Daftarkan Observer untuk Order — notifikasi email otomatis
        Order::observe(OrderObserver::class);

        // Rate limiter: maks 5 checkout per menit per IP
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}

