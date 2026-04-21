<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\MemberTopupStoreRequest;
use App\Models\WalletTopup;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\WalletTopupPaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MemberTopupController extends Controller
{
    public function index(Request $request, WalletTopupPaymentService $walletTopup): Response
    {
        $user = $request->user();

        $history = $user->walletTopups()
            ->latest('id')
            ->paginate(15)
            ->through(fn (WalletTopup $t) => [
                'invoice_code' => $t->invoice_code,
                'amount' => (float) $t->amount,
                'status' => $t->status,
                'status_label' => $t->status === 'success' ? 'Success' : ($t->status === 'pending' ? 'Menunggu' : 'Gagal'),
                'created_at' => $t->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('Member/Topup', [
            'history' => $history,
            'paymentChannels' => $walletTopup->paymentChannelsForUi(),
            'checkoutGateway' => app(PaymentGatewayInterface::class)->getGatewayName(),
            'minAmount' => MemberTopupStoreRequest::MIN_AMOUNT,
        ]);
    }

    public function store(MemberTopupStoreRequest $request, WalletTopupPaymentService $walletTopup): RedirectResponse
    {
        $user = $request->user();
        $amount = round((float) $request->validated('amount'), 2);
        $paymentMethod = $request->input('payment_method') ?: $walletTopup->defaultPaymentMethod();

        try {
            $topup = DB::transaction(function () use ($user, $amount, $paymentMethod, $walletTopup) {
                $topup = WalletTopup::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'status' => 'pending',
                    'payment_method' => $paymentMethod,
                ]);

                $walletTopup->startGatewaySession($topup->fresh(), $user, $paymentMethod);

                return $topup->fresh();
            });
        } catch (\Throwable $e) {
            Log::error('MemberTopupController: '.$e->getMessage());

            return back()->withErrors(['amount' => $e->getMessage() ?: 'Gagal membuat permintaan top up.']);
        }

        return redirect()->route('member.topup.show', $topup->invoice_code)
            ->with('success', 'Silakan selesaikan pembayaran top up Anda.');
    }

    public function show(Request $request, string $invoice): Response
    {
        $user = $request->user();
        $topup = WalletTopup::where('invoice_code', strtoupper($invoice))
            ->where('user_id', $user->id)
            ->firstOrFail();

        $pakKasirDetails = null;
        if ($topup->status === 'pending' && $topup->gateway === 'pak_kasir') {
            $p = $topup->payload['payment'] ?? $topup->payload ?? [];
            if (isset($p['payment_number'])) {
                $pakKasirDetails = [
                    'number' => $p['payment_number'],
                    'total_payment' => $p['total_payment'] ?? $p['amount'] ?? $topup->amount,
                    'method' => $p['payment_method'] ?? $topup->payment_method ?? 'qris',
                    'is_qris' => str_contains(strtolower($p['payment_method'] ?? 'qris'), 'qris'),
                ];
            }
        }

        return Inertia::render('Member/TopupStatus', [
            'topup' => [
                'invoice_code' => $topup->invoice_code,
                'amount' => (float) $topup->amount,
                'status' => $topup->status,
                'payment_url' => $topup->payment_url,
                'pak_kasir_details' => $pakKasirDetails,
                'payment_expired_at' => $topup->payment_expired_at?->toISOString(),
                'created_at' => $topup->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
            'app_env' => app()->environment(),
        ]);
    }
}
