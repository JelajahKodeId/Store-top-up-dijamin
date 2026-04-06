<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BannerController extends Controller
{
    public function index()
    {
        \Illuminate\Support\Facades\Gate::authorize('viewAny', Banner::class);
        $banners = Banner::latest()->orderByDesc('id')->get();
        return Inertia::render('Admin/Banners/Index', [
            'banners' => \App\Http\Resources\Admin\BannerResource::collection($banners),
        ]);
    }

    public function store(\App\Http\Requests\Admin\BannerRequest $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('create', Banner::class);
        
        try {
            $data = $request->validated();
            
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('banners', 'public');
                $data['image_url'] = \Illuminate\Support\Facades\Storage::url($path);
            }

            Banner::create($data);

            return back()->with('success', 'Banner berhasil ditambahkan.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Banner store failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan banner: ' . $e->getMessage());
        }
    }

    public function update(\App\Http\Requests\Admin\BannerRequest $request, Banner $banner)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', $banner);
        
        try {
            $data = $request->validated();
            
            if ($request->hasFile('image')) {
                // Delete old image
                if ($banner->image_url) {
                    $oldPath = str_replace('/storage/', '', $banner->image_url);
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                }
                
                $path = $request->file('image')->store('banners', 'public');
                $data['image_url'] = \Illuminate\Support\Facades\Storage::url($path);
            }

            $banner->update($data);

            return back()->with('success', 'Banner berhasil diperbarui.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Banner update failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui banner: ' . $e->getMessage());
        }
    }

    public function destroy(Banner $banner)
    {
        \Illuminate\Support\Facades\Gate::authorize('delete', $banner);
        
        try {
            // Delete image file
            if ($banner->image_url) {
                $oldPath = str_replace('/storage/', '', $banner->image_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            
            $banner->delete();
            return back()->with('success', 'Banner berhasil dihapus.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Banner delete failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus banner: ' . $e->getMessage());
        }
    }
}
