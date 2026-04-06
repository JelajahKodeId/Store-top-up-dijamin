<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'site' => Cache::remember('inertia_site_settings', 300, function () {
                $s = Setting::whereIn('key', [
                    'site_name', 'site_description', 'logo_web', 'favicon',
                    'whatsapp_number', 'instagram_username', 'facebook_page', 'tiktok_username',
                ])->pluck('value', 'key')->toArray();

                return [
                    'name'        => $s['site_name'] ?? 'Mall Store',
                    'description' => $s['site_description'] ?? 'Platform top-up game instan 24 jam.',
                    'logo'        => isset($s['logo_web']) && $s['logo_web'] ? '/storage/' . $s['logo_web'] : null,
                    'whatsapp'    => $s['whatsapp_number'] ?? null,
                    'instagram'   => $s['instagram_username'] ?? null,
                    'facebook'    => $s['facebook_page'] ?? null,
                    'tiktok'      => $s['tiktok_username'] ?? null,
                ];
            }),
        ];
    }
}
