<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManualPaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ManualPaymentMethodController extends Controller
{
    public function index()
    {
        $methods = ManualPaymentMethod::latest()->get()->map(function ($method) {
            return [
                'id' => $method->id,
                'name' => $method->name,
                'image' => $method->image_url,
                'account_number' => $method->account_number,
                'account_name' => $method->account_name,
                'instructions' => $method->instructions,
                'is_active' => $method->is_active,
                'created_at' => $method->created_at->format('d M Y H:i'),
            ];
        });

        return Inertia::render('Admin/ManualPaymentMethods/Index', [
            'methods' => $methods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'account_number' => 'nullable|string|max:100',
            'account_name' => 'nullable|string|max:100',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('manual-payments', 'public');
        }

        ManualPaymentMethod::create($validated);

        return redirect()->route('admin.manual-payment-methods.index')->with('success', 'Metode Pembayaran Manual berhasil ditambahkan.');
    }

    public function update(Request $request, ManualPaymentMethod $manualPaymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'account_number' => 'nullable|string|max:100',
            'account_name' => 'nullable|string|max:100',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($manualPaymentMethod->image && !str_starts_with($manualPaymentMethod->image, 'http')) {
                Storage::disk('public')->delete($manualPaymentMethod->image);
            }
            $validated['image'] = $request->file('image')->store('manual-payments', 'public');
        }

        $manualPaymentMethod->update($validated);

        return redirect()->route('admin.manual-payment-methods.index')->with('success', 'Metode Pembayaran Manual berhasil diperbarui.');
    }

    public function destroy(ManualPaymentMethod $manualPaymentMethod)
    {
        if ($manualPaymentMethod->image && !str_starts_with($manualPaymentMethod->image, 'http')) {
            Storage::disk('public')->delete($manualPaymentMethod->image);
        }
        
        $manualPaymentMethod->delete();

        return redirect()->route('admin.manual-payment-methods.index')->with('success', 'Metode Pembayaran Manual berhasil dihapus.');
    }
}
