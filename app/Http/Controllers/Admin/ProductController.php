<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\Admin\ProductResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(\App\Services\Admin\ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('viewAny', Product::class);
        $query = Product::with(['durations', 'fields'])->latest();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('slug', 'like', '%' . $request->search . '%');
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($products),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        \Illuminate\Support\Facades\Gate::authorize('create', Product::class);
        return Inertia::render('Admin/Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('create', Product::class);
        
        $this->productService->createProduct($request->validated());

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('view', $product);
        return Inertia::render('Admin/Products/Show', [
            'product' => new ProductResource($product->load(['durations', 'fields'])),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', $product);

        $this->productService->updateProduct($product, $request->validated());

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('delete', $product);
        
        try {
            $this->productService->deleteProduct($product);
            return back()->with('success', 'Produk berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
