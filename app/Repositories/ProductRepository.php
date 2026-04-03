<?php

namespace App\Repositories;

use App\Contracts\IProductRepository;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements IProductRepository
{
    public function getByCategory(int $categoryId): Collection
    {
        return Product::where('category_id', $categoryId)
            ->where('is_available', true)
            ->get();
    }

    public function findBySku(string $sku): ?Product
    {
        return Product::where('sku', $sku)->first();
    }
}
