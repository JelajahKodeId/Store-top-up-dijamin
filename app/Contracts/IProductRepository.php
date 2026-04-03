<?php

namespace App\Contracts;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface IProductRepository
{
    public function getByCategory(int $categoryId): Collection;
    public function findBySku(string $sku): ?Product;
}
