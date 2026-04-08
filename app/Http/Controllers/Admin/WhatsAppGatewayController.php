<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\WhatsAppGateway;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Panel admin: status QR & proxy ke wa-server (Node).
 */
class WhatsAppGatewayController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Setting::class);

        return Inertia::render('Admin/WhatsApp/Index', [
            'serverUrlConfigured' => $this->resolvedBaseUrl() !== null,
            'adminWhatsappHint' => Setting::where('key', 'whatsapp_number')->value('value'),
        ]);
    }

    public function status(): JsonResponse
    {
        Gate::authorize('viewAny', Setting::class);

        $base = $this->resolvedBaseUrl();
        if ($base === null) {
            return response()->json(['error' => 'WA_SERVER_URL tidak valid atau belum diatur di .env'], 503);
        }

        $response = $this->waHttp()->get("{$base}/status");

        return response()->json(
            $response->json() ?? ['error' => 'Respons tidak valid dari wa-server'],
            $response->status()
        );
    }

    public function logoutSession(): JsonResponse
    {
        Gate::authorize('viewAny', Setting::class);

        $base = $this->resolvedBaseUrl();
        if ($base === null) {
            return response()->json(['error' => 'WA_SERVER_URL tidak valid atau belum diatur'], 503);
        }

        $response = $this->waHttp()->post("{$base}/logout");

        return response()->json(
            $response->json() ?? [],
            $response->status()
        );
    }

    public function sendTest(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Setting::class);

        $validated = $request->validate([
            'number' => ['required', 'string', 'max:25'],
            'message' => ['required', 'string', 'max:4096'],
        ]);

        if (WhatsAppGateway::normalizeRecipientNumber($validated['number']) === null) {
            return response()->json(['error' => 'Format nomor tidak valid.'], 422);
        }

        if (app()->isProduction() && empty(config('services.whatsapp.server_secret'))) {
            return response()->json(['error' => 'WHATSAPP_SERVER_SECRET wajib di production.'], 503);
        }

        $base = $this->resolvedBaseUrl();
        if ($base === null) {
            return response()->json(['error' => 'WA_SERVER_URL tidak valid atau belum diatur'], 503);
        }

        $response = $this->waHttp()->post("{$base}/send", [
            'number' => $validated['number'],
            'message' => $validated['message'],
        ]);

        return response()->json(
            $response->json() ?? ['error' => 'Tidak ada respons'],
            $response->status()
        );
    }

    protected function resolvedBaseUrl(): ?string
    {
        return WhatsAppGateway::normalizeServerUrl(
            config('services.whatsapp.server_url'),
            app()->isProduction()
        );
    }

    /**
     * @return PendingRequest
     */
    protected function waHttp()
    {
        $req = Http::timeout(20)->acceptJson();

        $secret = config('services.whatsapp.server_secret');
        if (is_string($secret) && $secret !== '') {
            $req = $req->withToken($secret);
        }

        return $req;
    }
}
