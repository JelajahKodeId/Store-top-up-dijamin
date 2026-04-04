<?php

namespace App\Services\Admin;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductService
{
    /**
     * Create new product with dynamic fields and durations
     */
    public function createProduct(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'image' => $data['image'] ?? null,
                'status' => $data['status'],
            ]);

            if (isset($data['fields'])) {
                foreach ($data['fields'] as $field) {
                    $product->fields()->create($field);
                }
            }

            if (isset($data['durations'])) {
                foreach ($data['durations'] as $duration) {
                    $product->durations()->create($duration);
                }
            }

            return $product;
        });
    }

    /**
     * Update product and sync fields/durations
     */
    public function updateProduct(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'] ?? null,
                'image' => $data['image'] ?? null,
                'status' => $data['status'],
            ]);

            // Sync Fields
            if (isset($data['fields'])) {
                $fieldIds = collect($data['fields'])->pluck('id')->filter()->toArray();
                $product->fields()->whereNotIn('id', $fieldIds)->delete();
                foreach ($data['fields'] as $field) {
                    if (isset($field['id'])) {
                        $product->fields()->find($field['id'])->update($field);
                    } else {
                        $product->fields()->create($field);
                    }
                }
            }

            // Sync Durations
            if (isset($data['durations'])) {
                $durationIds = collect($data['durations'])->pluck('id')->filter()->toArray();
                $product->durations()->whereNotIn('id', $durationIds)->delete();
                foreach ($data['durations'] as $duration) {
                    if (isset($duration['id'])) {
                        $product->durations()->find($duration['id'])->update($duration);
                    } else {
                        $product->durations()->create($duration);
                    }
                }
            }

            return $product;
        });
    }

    /**
     * Delete product only if no successful sales exist
     */
    public function deleteProduct(Product $product): bool
    {
        if ($product->keys()->where('status', 'sold')->exists()) {
            throw new \Exception('Produk tidak dapat dihapus karena sudah memiliki riwayat penjualan.');
        }

        return $product->delete();
    }
}
