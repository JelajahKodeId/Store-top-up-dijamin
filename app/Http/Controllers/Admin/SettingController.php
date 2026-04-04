<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        \Illuminate\Support\Facades\Gate::authorize('viewAny', Setting::class);
        $settings = Setting::all();
        
        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('update', Setting::class);
        
        $data = $request->all();
        $fileKeys = ['logo_web', 'logo_footer', 'favicon'];

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($request, $data, $fileKeys) {
                foreach ($data as $key => $value) {
                    // Skip files in the first pass if they are null or not files
                    if (in_array($key, $fileKeys) && !$request->hasFile($key)) {
                        if ($value === null || $value === "") continue;
                    }

                    if ($request->hasFile($key) && in_array($key, $fileKeys)) {
                        $setting = Setting::where('key', $key)->first();
                        
                        // Delete old file
                        if ($setting && $setting->value) {
                            $oldPath = str_replace('/storage/', '', $setting->value);
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
                        }

                        $path = $request->file($key)->store('settings', 'public');
                        $value = \Illuminate\Support\Facades\Storage::url($path);
                    }

                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value]
                    );
                }
            });

            return back()->with('success', 'Pengaturan berhasil diperbarui.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Settings update failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }
}
