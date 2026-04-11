<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ProductReviewController extends Controller
{
    public function publish(Product $product, ProductReview $review): RedirectResponse
    {
        Gate::authorize('update', $product);
        abort_unless((int) $review->product_id === (int) $product->id, 404);

        $review->update(['is_published' => true]);

        return back()->with('success', 'Ulasan dipublikasikan.');
    }

    public function unpublish(Product $product, ProductReview $review): RedirectResponse
    {
        Gate::authorize('update', $product);
        abort_unless((int) $review->product_id === (int) $product->id, 404);

        $review->update(['is_published' => false]);

        return back()->with('success', 'Ulasan disembunyikan dari toko.');
    }

    public function destroy(Product $product, ProductReview $review): RedirectResponse
    {
        Gate::authorize('update', $product);
        abort_unless((int) $review->product_id === (int) $product->id, 404);

        $review->delete();

        return back()->with('success', 'Ulasan dihapus.');
    }
}
