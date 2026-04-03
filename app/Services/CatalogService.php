<?php

namespace App\Services;

use App\Contracts\ICategoryRepository;
use App\Contracts\IProductRepository;
use Illuminate\Database\Eloquent\Collection;

class CatalogService
{
    public function __construct(
        protected ICategoryRepository $categoryRepo,
        protected IProductRepository $productRepo
    ) {}

    /**
     * Get all active categories for landing page
     */
    public function getActiveCategories(): Collection
    {
        return $this->categoryRepo->allActive();
    }

    /**
     * Get a game category with its available products
     */
    public function getGameDetails(string $slug): array
    {
        $category = $this->categoryRepo->findBySlug($slug);
        
        if (!$category) {
            return [];
        }

        return [
            'category' => $category,
            'products' => $this->productRepo->getByCategory($category->id)
        ];
    }
}
