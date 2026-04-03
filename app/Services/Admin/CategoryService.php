<?php

namespace App\Services\Admin;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService
{
    /**
     * Get paginated categories with filters
     */
    public function getPaginatedCategories(array $filters = []): LengthAwarePaginator
    {
        $query = Category::latest();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        return $query->paginate(10)->withQueryString();
    }

    /**
     * Create new category
     */
    public function createCategory(array $data): Category
    {
        return DB::transaction(function () use ($data) {
            return Category::create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'image_url' => $data['image_url'] ?? null,
                'description' => $data['description'] ?? null,
                'fields' => $data['fields'] ?? [],
                'is_active' => $data['is_active'] ?? true,
            ]);
        });
    }

    /**
     * Update category
     */
    public function updateCategory(Category $category, array $data): Category
    {
        return DB::transaction(function () use ($category, $data) {
            $category->update([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'image_url' => $data['image_url'] ?? $category->image_url,
                'description' => $data['description'] ?? $category->description,
                'fields' => $data['fields'] ?? $category->fields,
                'is_active' => $data['is_active'] ?? $category->is_active,
            ]);

            return $category;
        });
    }

    /**
     * Delete category
     */
    public function deleteCategory(Category $category): bool
    {
        // Add safety check: cannot delete if has products
        if ($category->products()->count() > 0) {
            throw new \Exception('Kategori tidak dapat dihapus karena masih memiliki produk.');
        }

        return $category->delete();
    }
}
