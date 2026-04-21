<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberTier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class MemberTierController extends Controller
{
    public function index()
    {
        $tiers = MemberTier::orderBy('level')->get();
        return Inertia::render('Admin/MemberTiers/Index', [
            'tiers' => $tiers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|integer',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $slug = Str::slug($validated['name']);
        
        $exists = MemberTier::where('id', $slug)->exists();
        if ($exists) {
            $slug = $slug . '-' . time();
        }

        MemberTier::create([
            'id' => $slug,
            'name' => $validated['name'],
            'level' => $validated['level'],
            'price' => $validated['price'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Paket Member berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $tier = MemberTier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|integer',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $tier->update([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'price' => $validated['price'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Paket Member berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $tier = MemberTier::findOrFail($id);
        
        // Prevent deleting active standard tiers
        if ($tier->level === 0) {
            return back()->with('error', 'Paket dengan level 0 (Standard) tidak boleh dihapus.');
        }

        if ($tier->users()->exists()) {
            return back()->with('error', 'Paket tidak dapat dihapus karena masih digunakan oleh member.');
        }

        $tier->delete();

        return back()->with('success', 'Paket Member berhasil dihapus.');
    }
}
