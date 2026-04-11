<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class CatalogService
{
    /**
     * Get all active products for landing page.
     * Includes available_keys_count per duration agar ProductCard bisa cek stok.
     */
    public function getActiveProducts(): Collection
    {
        return Product::where('status', 'active')
            ->with(['durations' => fn ($q) => $q->where('is_active', true)
                ->withCount(['keys as available_keys_count' => fn ($q) => $q->where('status', 'available')])])
            ->latest()
            ->get();
    }

    /**
     * Get active banners for landing page
     */
    public function getActiveBanners(): Collection
    {
        return Banner::where('is_active', true)
            ->orderBy('order_index')
            ->get();
    }

    /**
     * Get product details by slug, including per-duration stock counts.
     */
    public function getProductDetails(string $slug): ?Product
    {
        return Product::where('slug', $slug)
            ->where('status', 'active')
            ->withCount(['keys as total_available_count' => fn ($q) => $q->where('status', 'available')])
            ->with([
                'durations' => fn ($q) => $q->where('is_active', true)
                    ->withCount(['keys as available_keys_count' => fn ($q) => $q->where('status', 'available')]),
                'fields' => fn ($q) => $q->orderBy('sort_order'),
                'reviews' => fn ($q) => $q->where('is_published', true)->orderByDesc('created_at')->limit(50),
            ])
            ->first();
    }

    /**
     * Get related products (other active products, excluding current), limit 6.
     * Tidak berdasarkan kategori karena Product tidak punya relasi category.
     */
    public function getRelatedProducts(Product $product, int $limit = 6): Collection
    {
        return Product::where('status', 'active')
            ->where('id', '!=', $product->id)
            ->with(['durations' => fn ($q) => $q->where('is_active', true)
                ->withCount(['keys as available_keys_count' => fn ($q) => $q->where('status', 'available')])])
            ->withCount(['keys as total_available_count' => fn ($q) => $q->where('status', 'available')])
            ->latest()
            ->limit($limit)
            ->get();
    }
}
