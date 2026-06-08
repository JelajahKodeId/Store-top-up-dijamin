<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GameFooter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GameFooterController extends Controller
{
    public function index()
    {
        $gameFooters = GameFooter::latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'image' => Storage::url($item->image),
            ];
        });

        return Inertia::render('Admin/GameFooters/Index', [
            'gameFooters' => $gameFooters,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|max:2048', // Max 2MB
        ]);

        $imagePath = $request->file('image')->store('footer-games', 'public');

        GameFooter::create([
            'name' => $request->name,
            'image' => $imagePath,
        ]);

        // Clear cache
        cache()->forget('shared_footer_data');

        return redirect()->back()->with('success', 'Game Footer berhasil ditambahkan.');
    }

    public function update(Request $request, GameFooter $gameFooter)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
        ];

        if ($request->hasFile('image')) {
            if (Storage::disk('public')->exists($gameFooter->image)) {
                Storage::disk('public')->delete($gameFooter->image);
            }
            $data['image'] = $request->file('image')->store('footer-games', 'public');
        }

        $gameFooter->update($data);

        // Clear cache
        cache()->forget('shared_footer_data');

        return redirect()->back()->with('success', 'Game Footer berhasil diperbarui.');
    }

    public function destroy(GameFooter $gameFooter)
    {
        if (Storage::disk('public')->exists($gameFooter->image)) {
            Storage::disk('public')->delete($gameFooter->image);
        }

        $gameFooter->delete();

        // Clear cache
        cache()->forget('shared_footer_data');

        return redirect()->back()->with('success', 'Game Footer berhasil dihapus.');
    }
}
