<?php

namespace App\Services\Admin;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Get paginated products with filters
     */
    public function getPaginatedProducts(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with('category')->latest();

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('sku', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Create new product
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            return Product::create($data);
        });
    }

    /**
     * Update product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update($data);
            return $product;
        });
    }

    /**
     * Delete product
     */
    public function deleteProduct(Product $product): bool
    {
        if ($product->orders()->count() > 0) {
            throw new \Exception('Produk tidak dapat dihapus karena sudah memiliki riwayat transaksi/pesanan.');
        }

        return $product->delete();
    }
}
