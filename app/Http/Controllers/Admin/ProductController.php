<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Services\Admin\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        $query = Product::with(['durations', 'fields'])
            ->withCount(['keys as keys_count' => fn ($q) => $q->where('status', 'available')])
            ->withSum([
                'orderItems as sold_count' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->where('status', \App\Enums\OrderStatus::SUCCESS)),
            ], 'quantity')
            ->latest()
            ->orderByDesc('id');

        if ($request->search) {
            $query->where('name', 'like', '%'.$request->search.'%')
                ->orWhere('slug', 'like', '%'.$request->search.'%');
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
        Gate::authorize('create', Product::class);

        $validated = $this->mergeUploadedImages($request, $request->validated(), null, null);
        if (isset($validated['description'])) {
            $validated['description'] = clean($validated['description']);
        }
        $this->productService->createProduct($validated);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        Gate::authorize('view', $product);

        $product->load([
            'durations' => fn ($q) => $q->orderByDesc('id')->withCount([
                'keys as available_keys_count' => fn ($q) => $q->where('status', 'available'),
            ]),
            'fields' => fn ($q) => $q->orderByDesc('id'),
            'reviews' => fn ($q) => $q->orderByDesc('created_at'),
        ]);

        $product->loadSum([
            'orderItems as sold_count' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->where('status', \App\Enums\OrderStatus::SUCCESS)),
        ], 'quantity');

        return Inertia::render('Admin/Products/Show', [
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        Gate::authorize('update', $product);

        $previousImage = $product->getRawOriginal('image');
        $previousBanner = $product->getRawOriginal('banner_image');
        $validated = $this->mergeUploadedImages($request, $request->validated(), $previousImage, $previousBanner);
        if (isset($validated['description'])) {
            $validated['description'] = clean($validated['description']);
        }
        $this->productService->updateProduct($product, $validated);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
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

    /**
     * Unggah file mengalahkan isian URL. Path lama di disk public dihapus jika diganti.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function mergeUploadedImages(Request $request, array $validated, ?string $previousStoredImage, ?string $previousStoredBanner): array
    {
        // Handle image_file
        unset($validated['image_file']);
        if ($request->hasFile('image_file')) {
            $validated['image'] = $request->file('image_file')->store('products', 'public');
            if (Product::isRelativeStoragePath($previousStoredImage)) {
                Storage::disk('public')->delete($previousStoredImage);
            }
        } else {
            $validated['image'] = isset($validated['image']) && $validated['image'] !== ''
                ? trim((string) $validated['image'])
                : null;

            if (Product::isRelativeStoragePath($previousStoredImage) && $validated['image'] !== $previousStoredImage) {
                Storage::disk('public')->delete($previousStoredImage);
            }
        }

        // Handle banner_image_file
        unset($validated['banner_image_file']);
        if ($request->hasFile('banner_image_file')) {
            $validated['banner_image'] = $request->file('banner_image_file')->store('products/banners', 'public');
            if (Product::isRelativeStoragePath($previousStoredBanner)) {
                Storage::disk('public')->delete($previousStoredBanner);
            }
        } else {
            $validated['banner_image'] = isset($validated['banner_image']) && $validated['banner_image'] !== ''
                ? trim((string) $validated['banner_image'])
                : null;

            if (Product::isRelativeStoragePath($previousStoredBanner) && $validated['banner_image'] !== $previousStoredBanner) {
                Storage::disk('public')->delete($previousStoredBanner);
            }
        }

        return $validated;
    }
}
