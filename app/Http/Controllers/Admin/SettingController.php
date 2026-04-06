<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        Gate::authorize('viewAny', Setting::class);
        $settings = Setting::all();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        Gate::authorize('update', Setting::class);

        // Hanya izinkan key yang dikenal — cegah _token, _method, dsb tersimpan ke DB
        $allowedKeys = [
            'site_name', 'site_description', 'site_keywords', 'announcement',
            'logo_web', 'logo_footer', 'favicon',
            'whatsapp_number', 'instagram_username', 'facebook_page', 'tiktok_username',
            'contact_email', 'contact_phone', 'address',
        ];
        $fileKeys = ['logo_web', 'logo_footer', 'favicon'];
        $data = $request->only($allowedKeys);

        try {
            DB::transaction(function () use ($request, $data, $fileKeys) {
                foreach ($data as $key => $value) {
                    // Skip file keys jika tidak ada upload baru dan value kosong
                    if (in_array($key, $fileKeys) && ! $request->hasFile($key)) {
                        if ($value === null || $value === '') {
                            continue;
                        }
                    }

                    if ($request->hasFile($key) && in_array($key, $fileKeys)) {
                        $setting = Setting::where('key', $key)->first();

                        // Hapus file lama — nilai di DB adalah path relatif disk (e.g. settings/file.jpg)
                        if ($setting && $setting->value) {
                            Storage::disk('public')->delete($setting->value);
                        }

                        // Simpan HANYA path relatif ke DB; HandleInertiaRequests menambahkan /storage/
                        $value = $request->file($key)->store('settings', 'public');
                    }

                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value]
                    );
                }
            });

            Cache::forget('inertia_site_settings');

            return back()->with('success', 'Pengaturan berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Settings update failed: '.$e->getMessage());

            return back()->with('error', 'Gagal memperbarui pengaturan: '.$e->getMessage());
        }
    }
}
