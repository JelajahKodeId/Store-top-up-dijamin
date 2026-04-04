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
        ]);
    }
}
