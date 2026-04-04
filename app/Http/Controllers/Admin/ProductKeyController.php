<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductDuration;
use App\Models\ProductKey;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductKeyController extends Controller
{
    public function index(Request $request, Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('view', $product);
        $query = $product->keys()->with('duration');

        if ($request->duration_id) {
            $query->where('product_duration_id', $request->duration_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('key_code', 'like', '%' . $request->search . '%');
        }

        $keys = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Products/Keys/Index', [
            'product' => $product,
            'durations' => $product->durations,
            'keys' => $keys,
            'filters' => $request->only(['duration_id', 'status', 'search']),
        ]);
    }

    public function store(Request $request, Product $product)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', $product);
        $request->validate([
            'product_duration_id' => 'required|exists:product_durations,id',
            'keys' => 'required|string', // Bulk input separate by newline
        ]);

        try {
            $keyCodes = explode("\n", str_replace("\r", "", $request->keys));
            $count = 0;

            \Illuminate\Support\Facades\DB::transaction(function () use ($product, $request, $keyCodes, &$count) {
                foreach ($keyCodes as $code) {
                    $code = trim($code);
                    if (empty($code)) continue;

                    ProductKey::updateOrCreate([
                        'product_id' => $product->id,
                        'key_code' => $code,
                    ], [
                        'product_duration_id' => $request->product_duration_id,
                        'status' => 'available',
                    ]);
                    $count++;
                }
            });

            return back()->with('success', "$count Key berhasil ditambahkan.");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Product keys store failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan key: ' . $e->getMessage());
        }
    }

    public function destroy(ProductKey $key)
    {
        \Illuminate\Support\Facades\Gate::authorize('delete', $key->product);
        
        try {
            if ($key->status === 'sold') {
                return back()->with('error', 'Key yang sudah terjual tidak dapat dihapus.');
            }

            $key->delete();

            return back()->with('success', 'Key berhasil dihapus.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Product key delete failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus key: ' . $e->getMessage());
        }
    }
}
