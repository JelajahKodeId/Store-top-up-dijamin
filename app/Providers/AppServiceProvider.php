<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use App\Services\Payment\MidtransService;
use App\Services\Payment\MockPaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\TripayService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
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
        $this->app->bind(PaymentGatewayInterface::class, function ($app) {
            $driver = strtolower((string) config('services.payment.driver', 'midtrans'));

            if ($driver === 'tripay') {
                return new TripayService;
            }

            if ($driver === 'midtrans' && filled(config('services.midtrans.server_key'))) {
                return new MidtransService;
            }

            if ($driver === 'mock') {
                return new MockPaymentService;
            }

            // Tanpa kunci Midtrans → mock (lokal / staging)
            return new MockPaymentService;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Vite::prefetch(concurrency: 3);

        // Daftarkan Observer untuk Order — notifikasi email otomatis
        Order::observe(OrderObserver::class);

        // Rate limiter: maks 5 checkout per menit per IP
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
