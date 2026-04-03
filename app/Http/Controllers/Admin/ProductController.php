<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Services\Admin\ProductService;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\Admin\ProductResource;
use App\Http\Resources\Admin\CategoryResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Product::class);

        $products = $this->productService->getPaginatedProducts($request->all());
        $categories = Category::active()->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($products),
            'categories' => CategoryResource::collection($categories),
            'filters' => $request->only(['search', 'category_id', 'active']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        Gate::authorize('view', $product);

        return Inertia::render('Admin/Products/Show', [
            'product' => new ProductResource($product->load(['category', 'category.products'])),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        Gate::authorize('create', Product::class);

        $this->productService->createProduct($request->validated());

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        Gate::authorize('update', $product);

        $this->productService->updateProduct($product, $request->validated());

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        Gate::authorize('delete', $product);

        try {
            $this->productService->deleteProduct($product);
            return back()->with('success', 'Produk berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
