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
        // Dinamis: Sembunyikan rute admin dari non-admin di Ziggy @routes
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            config(['ziggy.except' => ['admin.*', 'horizon.*', 'ignition.*']]);
        } else {
            config(['ziggy.except' => []]);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone_number' => $request->user()->phone_number,
                    'balance' => (float) $request->user()->balance,
                    'member_tier' => $request->user()->member_tier ?? 'standard',
                    'member_level' => $request->user()->tier ? (int) $request->user()->tier->level : 0,
                    'member_tier_label' => $request->user()->tier ? $request->user()->tier->name : 'Member',
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
                'whatsapp_url' => $request->session()->get('whatsapp_url'),
            ],
            'site' => Cache::remember('inertia_site_settings', 300, function () {
                $s = Setting::whereIn('key', [
                    'site_name', 'site_description', 'logo_web', 'favicon',
                    'whatsapp_number', 'instagram_username', 'telegram_username', 'facebook_page', 'tiktok_username',
                    'whatsapp_channel', 'telegram_channel',
                    'running_text', 'site_keywords', 'announcement', 'contact_email', 'contact_phone',
                ])->pluck('value', 'key')->toArray();

                return [
                    'name' => $s['site_name'] ?? 'Mall Store',
                    'description' => $s['site_description'] ?? 'Platform top-up game instan 24 jam.',
                    'logo' => isset($s['logo_web']) && $s['logo_web'] ? '/storage/'. $s['logo_web'] : null,
                    'whatsapp' => $s['whatsapp_number'] ?? null,
                    'instagram' => $s['instagram_username'] ?? null,
                    'telegram' => $s['telegram_username'] ?? null,
                    'facebook' => $s['facebook_page'] ?? null,
                    'tiktok' => $s['tiktok_username'] ?? null,
                    'wa_channel' => $s['whatsapp_channel'] ?? null,
                    'tg_channel' => $s['telegram_channel'] ?? null,
                    'running_text' => $s['running_text'] ?? null,
                    'keywords' => $s['site_keywords'] ?? null,
                    'announcement' => $s['announcement'] ?? null,
                    'contact_email' => $s['contact_email'] ?? null,
                    'contact_phone' => $s['contact_phone'] ?? null,
                ];
            }),
            'shared_footer_data' => Cache::remember('shared_footer_data', 300, function () {
                $gameImages = \App\Models\GameFooter::latest()
                    ->get()
                    ->map(fn ($p) => [
                        'name' => $p->name,
                        'image_url' => \Illuminate\Support\Facades\Storage::url($p->image),
                    ]);
                
                $paymentChannels = [];
                try {
                    $gateway = app(\App\Services\Payment\PaymentGatewayInterface::class);
                    $paymentChannels = $gateway->getPaymentChannels();
                } catch (\Throwable $th) {
                }

                $manualMethods = \App\Models\ManualPaymentMethod::where('is_active', true)->get()->map(function ($m) {
                    return [
                        'code' => 'manual_' . $m->id,
                        'label' => $m->name,
                        'icon_url' => $m->image_url,
                    ];
                })->toArray();

                return [
                    'game_images' => $gameImages->toArray(),
                    'payment_channels' => collect($paymentChannels)->map(function ($c) {
                        $code = strtolower($c['code'] ?? '');
                        $iconUrl = $c['icon_url'] ?? null;
                        
                        if (!$iconUrl) {
                            if (str_contains($code, 'qris')) $iconUrl = '/img/payment/qris.png';
                            elseif (str_contains($code, 'bni')) $iconUrl = '/img/payment/bni.png';
                            elseif (str_contains($code, 'bri')) $iconUrl = '/img/payment/bri.png';
                            elseif (str_contains($code, 'bca')) $iconUrl = '/img/payment/bca.webp';
                            elseif (str_contains($code, 'mandiri')) $iconUrl = '/img/payment/mandiri.png';
                            elseif (str_contains($code, 'cimb')) $iconUrl = '/img/payment/cimb.png';
                            elseif (str_contains($code, 'permata')) $iconUrl = '/img/payment/permata.png';
                            elseif (str_contains($code, 'ovo')) $iconUrl = '/img/payment/ovo.png';
                            elseif (str_contains($code, 'dana')) $iconUrl = '/img/payment/dana.png';
                            elseif (str_contains($code, 'shopee')) $iconUrl = '/img/payment/shopee.png';
                            elseif (str_contains($code, 'alfamart')) $iconUrl = '/img/payment/alfamart.png';
                            elseif (str_contains($code, 'indomaret')) $iconUrl = '/img/payment/indoemaret.png';
                            elseif (str_contains($code, 'maybank')) $iconUrl = '/img/payment/maybank.png';
                            elseif (str_contains($code, 'neo') || str_contains($code, 'bnc')) $iconUrl = '/img/payment/BNC.webp';
                            elseif (str_contains($code, 'bersama')) $iconUrl = '/img/payment/bersama.png';
                            elseif (str_contains($code, 'artha')) $iconUrl = '/img/payment/artha-graha.png';
                            elseif (str_contains($code, 'sampoerna')) $iconUrl = '/img/payment/sahabat-sampoerna.png';
                        }
                        
                        return [
                            'code' => $code,
                            'label' => $c['label'] ?? '',
                            'icon_url' => $iconUrl,
                        ];
                    })->merge($manualMethods)->values()->toArray(),
                ];
            }),
        ];
    }
}
