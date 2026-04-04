<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class CatalogService
{
    /**
     * Get all active products for landing page
     */
    public function getActiveProducts(): Collection
    {
        return Product::where('status', 'active')
            ->with(['durations' => fn($q) => $q->where('is_active', true)])
            ->latest()
            ->get();
    }

    /**
     * Get product details by slug
     */
    public function getProductDetails(string $slug): ?Product
    {
        return Product::where('slug', $slug)
            ->where('status', 'active')
            ->with(['durations' => fn($q) => $q->where('is_active', true), 'fields'])
            ->first();
    }
}
