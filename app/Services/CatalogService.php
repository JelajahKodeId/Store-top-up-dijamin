<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Banner;
use App\Models\Product;
use App\Support\ProductGameCategory;
use Illuminate\Database\Eloquent\Collection;

class CatalogService
{
    /**
     * Get all active products for landing / katalog.
     * Includes available_keys_count per duration agar ProductCard bisa cek stok.
     *
     * @param  string|null  $gameCategory  Slug kategori (mis. mlbb); null = semua.
     */
    public function getActiveProducts(?string $gameCategory = null): Collection
    {
        $query = Product::where('status', 'active');

        if ($gameCategory !== null && $gameCategory !== '') {
            $query->where('game_category', $gameCategory);
        }

        return $query
            ->with(['durations' => fn ($q) => $q->where('is_active', true)
                ->withCount(['keys as available_keys_count' => fn ($q) => $q->where('status', 'available')])])
            ->withSum([
                'orderItems as sold_count' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->where('status', OrderStatus::SUCCESS)),
            ], 'quantity')
            ->latest()
            ->get();
    }

    /**
     * Kategori game yang dipakai produk aktif (untuk chip filter di home / katalog).
     *
     * @return list<array{value: string, label: string}>
     */
    public function getActiveGameCategoriesForFilter(): array
    {
        $slugs = Product::query()
            ->where('status', 'active')
            ->whereNotNull('game_category')
            ->where('game_category', '!=', '')
            ->distinct()
            ->orderBy('game_category')
            ->pluck('game_category')
            ->all();

        return ProductGameCategory::filterOptions($slugs);
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
            ->withSum([
                'orderItems as sold_count' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->where('status', OrderStatus::SUCCESS)),
            ], 'quantity')
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
     * Jika `game_category` sama tersedia, diutamakan; sisanya diisi produk lain.
     */
    public function getRelatedProducts(Product $product, int $limit = 6): Collection
    {
        $base = Product::where('status', 'active')
            ->where('id', '!=', $product->id)
            ->with(['durations' => fn ($q) => $q->where('is_active', true)
                ->withCount(['keys as available_keys_count' => fn ($q) => $q->where('status', 'available')])])
            ->withCount(['keys as total_available_count' => fn ($q) => $q->where('status', 'available')])
            ->withSum([
                'orderItems as sold_count' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->where('status', OrderStatus::SUCCESS)),
            ], 'quantity');

        $gc = $product->getAttributes()['game_category'] ?? null;
        if (is_string($gc) && $gc !== '') {
            $same = (clone $base)->where('game_category', $gc)->latest()->limit($limit)->get();
            if ($same->count() >= $limit) {
                return $same;
            }
            $restIds = $same->pluck('id')->all();
            $more = (clone $base)->whereNotIn('id', $restIds)->latest()->limit($limit - $same->count())->get();

            return $same->concat($more);
        }

        return $base->latest()->limit($limit)->get();
    }
}
