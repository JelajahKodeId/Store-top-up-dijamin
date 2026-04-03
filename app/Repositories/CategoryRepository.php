<?php

namespace App\Repositories;

use App\Contracts\ICategoryRepository;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository implements ICategoryRepository
{
    public function allActive(): Collection
    {
        return Category::where('is_active', true)->get();
    }

    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }

    public function findWithProducts(int $id): ?Category
    {
        return Category::with('products')->find($id);
    }
}
