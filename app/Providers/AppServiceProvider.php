<?php

namespace App\Providers;

use App\Models\Order;
use App\Observers\OrderObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\ICategoryRepository::class,
            \App\Repositories\CategoryRepository::class
        );

        $this->app->bind(
            \App\Contracts\IProductRepository::class,
            \App\Repositories\ProductRepository::class
        );
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
    }
}

