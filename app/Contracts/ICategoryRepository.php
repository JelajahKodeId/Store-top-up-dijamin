<?php

namespace App\Contracts;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface ICategoryRepository
{
    public function allActive(): Collection;
    public function findBySlug(string $slug): ?Category;
    public function findWithProducts(int $id): ?Category;
}
