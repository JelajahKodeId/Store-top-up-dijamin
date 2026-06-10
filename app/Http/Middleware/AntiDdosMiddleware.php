<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AntiDdosMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Pengecualian untuk IP lokal jika diperlukan (opsional)
        // if ($ip === '127.0.0.1' || $ip === '::1') {
        //     return $next($request);
        // }

        $bannedKey = 'banned_ip:' . $ip;

        // 1. Cek apakah IP ini sudah masuk daftar hitam (banned)
        if (Cache::has($bannedKey)) {
            // Langsung hentikan request dengan string polos agar sangat ringan untuk CPU
            return response('403 Forbidden. IP Anda diblokir karena aktivitas yang tidak wajar.', 403)
                ->header('Content-Type', 'text/plain');
        }

        // 2. Pantau kecepatan request per IP
        $limitKey = 'ddos_track:' . $ip;
        $maxAttempts = 100; // Maksimal 100 request
        $decayMinutes = 1;  // Dalam 1 menit

        if (RateLimiter::tooManyAttempts($limitKey, $maxAttempts)) {
            // IP melewati batas wajar -> BAN selama 24 jam (86400 detik)
            Cache::put($bannedKey, true, 86400);

            // Bersihkan data tracking
            RateLimiter::clear($limitKey);

            return response('403 Forbidden. IP Anda diblokir karena aktivitas yang tidak wajar.', 403)
                ->header('Content-Type', 'text/plain');
        }

        // Catat request IP ini
        RateLimiter::hit($limitKey, $decayMinutes * 60);

        return $next($request);
    }
}
