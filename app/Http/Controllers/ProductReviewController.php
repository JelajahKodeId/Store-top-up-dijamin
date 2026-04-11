<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductReviewController extends Controller
{
    /**
     * Ulasan hanya dari pembeli: wajib invoice pesanan selesai (success) yang berisi produk ini.
     */
    public function store(Request $request, string $slug): RedirectResponse
    {
        $product = Product::where('slug', $slug)->where('status', 'active')->firstOrFail();

        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:120'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
            'invoice_code' => ['required', 'string', 'max:100'],
        ]);

        $invoiceUpper = strtoupper(trim($validated['invoice_code']));

        if (ProductReview::where('product_id', $product->id)->where('invoice_code', $invoiceUpper)->exists()) {
            throw ValidationException::withMessages([
                'invoice_code' => 'Ulasan untuk invoice ini sudah pernah dikirim.',
            ]);
        }

        $order = Order::where('invoice_code', $invoiceUpper)
            ->with('items')
            ->first();

        if (! $order || $order->status !== OrderStatus::SUCCESS) {
            throw ValidationException::withMessages([
                'invoice_code' => 'Invoice tidak ditemukan atau pesanan belum selesai. Ulasan hanya bisa dikirim setelah transaksi berhasil.',
            ]);
        }

        if (! $order->items->contains(fn ($item) => (int) $item->product_id === (int) $product->id)) {
            throw ValidationException::withMessages([
                'invoice_code' => 'Invoice ini tidak termasuk produk yang Anda ulas.',
            ]);
        }

        ProductReview::create([
            'product_id' => $product->id,
            'author_name' => $validated['author_name'],
            'rating' => $validated['rating'],
            'body' => $validated['body'],
            'invoice_code' => $invoiceUpper,
            'verified_purchase' => true,
            'is_published' => true,
        ]);

        return back()->with('success', 'Terima kasih! Ulasan Anda telah ditampilkan.');
    }
}
