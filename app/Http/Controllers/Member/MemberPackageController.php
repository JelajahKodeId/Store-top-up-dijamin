<?php

namespace App\Http\Controllers\Member;

use App\Models\MemberTier;
use App\Http\Controllers\Controller;
use App\Http\Requests\Member\MemberPackageStoreRequest;
use App\Models\MemberTierUpgrade;
use App\Services\MemberTierUpgradePaymentService;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MemberPackageController extends Controller
{
    public function index(Request $request, MemberTierUpgradePaymentService $payments): Response
    {
        $user = $request->user();
        $user->load('tier');
        $currentTier = $user->tier;
        $currentLevel = $currentTier ? $currentTier->level : 0;

        $packages = MemberTier::whereNotNull('price')
            ->where('is_active', true)
            ->orderBy('level')
            ->get()
            ->map(function (MemberTier $tier) use ($currentLevel) {
                // Active if the user's current level is >= the package level (already has this tier)
                $active = $currentLevel >= $tier->level;
                // Purchasable if it's the immediate next tier
                $purchasable = $tier->level > $currentLevel;

                return [
                    'code' => $tier->id,
                    'label' => $tier->name,
                    'price' => (float) $tier->price,
                    'active' => $active,
                    'purchasable' => $purchasable,
                ];
            })->values()->all();

        $history = $user->memberTierUpgrades()->with('targetTier')
            ->latest('id')
            ->take(20)
            ->get()
            ->map(fn (MemberTierUpgrade $u) => [
                'invoice_code' => $u->invoice_code,
                'target_label' => $u->targetTier ? $u->targetTier->name : 'Unknown Tier',
                'amount' => (float) $u->amount,
                'status' => $u->status,
                'created_at' => $u->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Member/Packages', [
            'packages' => $packages,
            'currentTier' => $currentTier ? $currentTier->id : 'standard',
            'currentTierLabel' => $currentTier ? $currentTier->name : 'Member',
            'paymentChannels' => $payments->paymentChannelsForUi(),
            'checkoutGateway' => app(\App\Services\Payment\PakKasirService::class)->getGatewayName(),
            'history' => $history,
        ]);
    }

    public function store(MemberPackageStoreRequest $request, MemberTierUpgradePaymentService $payments): RedirectResponse
    {
        $user = $request->user();
        $user->load('tier');
        $targetId = collect($request->input())->get('tier') ?? $request->input('target_tier'); 
        
        $target = MemberTier::where('id', $targetId)->where('is_active', true)->whereNotNull('price')->first();
        
        if (! $target) {
            return back()->withErrors(['target_tier' => 'Paket tidak valid.']);
        }

        $price = $target->price;
        $currentLevel = $user->tier ? $user->tier->level : 0;

        $purchasable = $target->level > $currentLevel;

        if (! $purchasable) {
            return back()->withErrors(['target_tier' => 'Anda tidak dapat memilih paket ini.']);
        }

        $pending = MemberTierUpgrade::query()
            ->where('user_id', $user->id)
            ->where('target_tier', $target->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return back()->withErrors(['target_tier' => 'Selesaikan pembayaran upgrade sebelumnya untuk paket ini terlebih dahulu.']);
        }

        $paymentMethod = $request->input('payment_method') ?: $payments->defaultPaymentMethod();

        try {
            $upgrade = DB::transaction(function () use ($user, $target, $price, $paymentMethod, $payments) {
                $row = MemberTierUpgrade::create([
                    'user_id' => $user->id,
                    'target_tier' => $target->id,
                    'amount' => $price,
                    'status' => 'pending',
                    'payment_method' => $paymentMethod,
                ]);

                $payments->startGatewaySession($row->fresh(), $user, $paymentMethod);

                return $row->fresh();
            });
        } catch (\Throwable $e) {
            Log::error('MemberPackageController: '.$e->getMessage());

            return back()->withErrors(['target_tier' => $e->getMessage() ?: 'Gagal membuat pembayaran upgrade.']);
        }

        return redirect()->route('member.packages.show', $upgrade->invoice_code)
            ->with('success', 'Silakan selesaikan pembayaran untuk mengaktifkan paket.');
    }

    public function show(Request $request, string $invoice): Response
    {
        $user = $request->user();
        $upgrade = MemberTierUpgrade::with('targetTier')->where('invoice_code', strtoupper($invoice))
            ->where('user_id', $user->id)
            ->firstOrFail();

        $pakKasirDetails = null;
        if ($upgrade->status === 'pending' && $upgrade->gateway === 'pak_kasir') {
            $p = $upgrade->payload['payment'] ?? $upgrade->payload ?? [];
            if (isset($p['payment_number'])) {
                $pakKasirDetails = [
                    'number' => $p['payment_number'],
                    'total_payment' => $p['total_payment'] ?? $p['amount'] ?? $upgrade->amount,
                    'method' => $p['payment_method'] ?? $upgrade->payment_method ?? 'qris',
                    'is_qris' => str_contains(strtolower($p['payment_method'] ?? 'qris'), 'qris'),
                ];
            }
        }

        return Inertia::render('Member/PackageStatus', [
            'upgrade' => [
                'invoice_code' => $upgrade->invoice_code,
                'target_tier' => $upgrade->targetTier ? $upgrade->targetTier->id : $upgrade->target_tier,
                'target_label' => $upgrade->targetTier ? $upgrade->targetTier->name : 'Upgrade',
                'amount' => (float) $upgrade->amount,
                'status' => $upgrade->status,
                'payment_url' => $upgrade->payment_url,
                'pak_kasir_details' => $pakKasirDetails,
                'payment_expired_at' => $upgrade->payment_expired_at?->toISOString(),
                'created_at' => $upgrade->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
            'app_env' => app()->environment(),
        ]);
    }
}
