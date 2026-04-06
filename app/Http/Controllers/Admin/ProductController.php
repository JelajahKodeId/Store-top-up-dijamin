<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\Admin\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        $query = Product::with(['durations', 'fields'])
            ->withCount(['keys as keys_count' => fn ($q) => $q->where('status', 'available')])
            ->latest()
            ->orderByDesc('id');

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
     * Redirects to index since create is handled via modal.
     */
    public function create()
    {
        return redirect()->route('admin.products.index');
    }

    /**
     * Show the form for editing the specified resource.
     * Redirects to index since edit is handled via modal on the index page.
     */
    public function edit(Product $product)
    {
        return redirect()->route('admin.products.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('create', Product::class);

        $validated = $this->mergeUploadedProductImage($request, $request->validated(), null);
        $this->productService->createProduct($validated);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('view', $product);

        $product->load([
            'durations' => fn ($q) => $q->orderByDesc('id')->withCount([
                'keys as available_keys_count' => fn ($q) => $q->where('status', 'available'),
            ]),
            'fields' => fn ($q) => $q->orderByDesc('id'),
        ]);

        return Inertia::render('Admin/Products/Show', [
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', $product);

        $previous = $product->getRawOriginal('image');
        $validated = $this->mergeUploadedProductImage($request, $request->validated(), $previous);
        $this->productService->updateProduct($product, $validated);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
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

    /**
     * Unggah file mengalahkan isian URL. Path lama di disk public dihapus jika diganti.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function mergeUploadedProductImage(Request $request, array $validated, ?string $previousStored): array
    {
        unset($validated['image_file']);

        if ($request->hasFile('image_file')) {
            $validated['image'] = $request->file('image_file')->store('products', 'public');
            if (Product::isRelativeStoragePath($previousStored)) {
                Storage::disk('public')->delete($previousStored);
            }

            return $validated;
        }

        $validated['image'] = isset($validated['image']) && $validated['image'] !== ''
            ? trim((string) $validated['image'])
            : null;

        if (Product::isRelativeStoragePath($previousStored) && $validated['image'] !== $previousStored) {
            Storage::disk('public')->delete($previousStored);
        }

        return $validated;
    }
}
