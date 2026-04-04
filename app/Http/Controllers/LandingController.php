<?php

namespace App\Http\Controllers;

use App\Services\CatalogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Display the landing page with products.
     */
    public function index(): Response
    {
        return Inertia::render('Guest/Home', [
            'products' => $this->catalogService->getActiveProducts(),
            'banners' => $this->catalogService->getActiveBanners(),
        ]);
    }

    /**
     * Display the catalog page.
     */
    public function catalog(): Response
    {
        return Inertia::render('Guest/Catalog', [
            'products' => $this->catalogService->getActiveProducts(),
        ]);
    }

    /**
     * Display product detail page.
     */
    public function show(string $slug): Response
    {
        $product = $this->catalogService->getProductDetails($slug);

        if (!$product) {
            abort(404);
        }

        return Inertia::render('Guest/ProductDetail', [
            'product' => $product,
        ]);
    }

    /**
     * Display tracking invoice page.
     */
    public function trackInvoice(): Response
    {
        return Inertia::render('Guest/TrackInvoice');
    }
}
