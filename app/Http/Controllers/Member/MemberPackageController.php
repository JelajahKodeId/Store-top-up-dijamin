<?php

namespace App\Http\Controllers\Member;

use App\Enums\MemberTier;
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
        $current = MemberTier::fromDatabase($user->getAttributes()['member_tier'] ?? null);

        $packages = collect(MemberTier::purchasableTiers())->map(function (MemberTier $tier) use ($current) {
            $active = $current->rank() >= $tier->rank();
            $purchasable = match ($tier) {
                MemberTier::Reseller => $current === MemberTier::Standard,
                MemberTier::Vip => $current->rank() < MemberTier::Vip->rank(),
                default => false,
            };

            return [
                'code' => $tier->value,
                'label' => $tier->label(),
                'price' => (float) $tier->upgradePrice(),
                'active' => $active,
                'purchasable' => $purchasable,
            ];
        })->values()->all();

        $history = $user->memberTierUpgrades()
            ->latest('id')
            ->take(20)
            ->get()
            ->map(fn (MemberTierUpgrade $u) => [
                'invoice_code' => $u->invoice_code,
                'target_label' => $u->target_tier->label(),
                'amount' => (float) $u->amount,
                'status' => $u->status,
                'created_at' => $u->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Member/Packages', [
            'packages' => $packages,
            'currentTier' => $current->value,
            'currentTierLabel' => $current->label(),
            'paymentChannels' => $payments->paymentChannelsForUi(),
            'checkoutGateway' => app(PaymentGatewayInterface::class)->getGatewayName(),
            'history' => $history,
        ]);
    }

    public function store(MemberPackageStoreRequest $request, MemberTierUpgradePaymentService $payments): RedirectResponse
    {
        $user = $request->user();
        $target = $request->tier();
        $price = $target->upgradePrice();

        if ($price === null) {
            return back()->withErrors(['target_tier' => 'Paket tidak valid.']);
        }

        $current = MemberTier::fromDatabase($user->getAttributes()['member_tier'] ?? null);

        $purchasable = match ($target) {
            MemberTier::Reseller => $current === MemberTier::Standard,
            MemberTier::Vip => $current->rank() < MemberTier::Vip->rank(),
            default => false,
        };

        if (! $purchasable) {
            return back()->withErrors(['target_tier' => 'Anda tidak dapat memilih paket ini.']);
        }

        $pending = MemberTierUpgrade::query()
            ->where('user_id', $user->id)
            ->where('target_tier', $target->value)
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
                    'target_tier' => $target,
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
        $upgrade = MemberTierUpgrade::where('invoice_code', strtoupper($invoice))
            ->where('user_id', $user->id)
            ->firstOrFail();

        $targetTier = MemberTier::fromDatabase($upgrade->getAttributes()['target_tier'] ?? null);

        return Inertia::render('Member/PackageStatus', [
            'upgrade' => [
                'invoice_code' => $upgrade->invoice_code,
                'target_tier' => $targetTier->value,
                'target_label' => $targetTier->label(),
                'amount' => (float) $upgrade->amount,
                'status' => $upgrade->status,
                'payment_url' => $upgrade->payment_url,
                'payment_expired_at' => $upgrade->payment_expired_at?->toISOString(),
                'created_at' => $upgrade->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
