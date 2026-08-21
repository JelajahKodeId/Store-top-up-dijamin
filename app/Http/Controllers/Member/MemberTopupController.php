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

        $feeAmount = 0;
        if (!str_starts_with($paymentMethod, 'manual_')) {
            $channels = $walletTopup->paymentChannelsForUi();
            $selectedChannel = collect($channels)->firstWhere('code', $paymentMethod);
            if ($selectedChannel) {
                $feeFlat = (float) ($selectedChannel['fee'] ?? 0);
                $feePct = (float) ($selectedChannel['fee_pct'] ?? 0);
                $feeAmount = $feeFlat + ($amount * $feePct / 100);
            }
        }

        try {
            $topup = DB::transaction(function () use ($user, $amount, $feeAmount, $paymentMethod, $walletTopup) {
                $topup = WalletTopup::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'fee_amount' => $feeAmount,
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

        $directPaymentDetails = null;
        if ($topup->status === 'pending') {
            $p = $topup->payload['payment'] ?? $topup->payload ?? [];
            if ($topup->gateway === 'pak_kasir' && isset($p['payment_number'])) {
                $directPaymentDetails = [
                    'number' => $p['payment_number'],
                    'total_payment' => $p['total_payment'] ?? $p['amount'] ?? $topup->amount,
                    'method' => $p['payment_method'] ?? $topup->payment_method ?? 'qris',
                    'is_qris' => str_contains(strtolower($p['payment_method'] ?? 'qris'), 'qris'),
                    'qr_url' => null,
                ];
            } elseif ($topup->gateway === 'genspay') {
                if (isset($p['qr_string'])) {
                    $directPaymentDetails = [
                        'number' => $p['qr_string'],
                        'total_payment' => $p['amount'] ?? $topup->amount,
                        'method' => 'QRIS',
                        'is_qris' => true,
                        'qr_url' => null, // We'll generate QR client-side from qr_string
                    ];
                } elseif (isset($p['pay_address'])) {
                    $directPaymentDetails = [
                        'number' => $p['pay_address'],
                        'total_payment' => $p['pay_amount'],
                        'method' => 'USDT (BSC)',
                        'is_qris' => false,
                        'qr_url' => null,
                    ];
                }
            }
        }

        $manualPaymentDetails = null;
        if ($topup && $topup->gateway === 'manual') {
            $manualPaymentDetails = $topup->payload;
        }

        return Inertia::render('Member/TopupStatus', [
            'topup' => [
                'invoice_code' => $topup->invoice_code,
                'amount' => (float) $topup->amount,
                'fee_amount' => (float) $topup->fee_amount,
                'status' => $topup->status,
                'payment_url' => $topup->payment_url,
                'direct_payment_details' => $directPaymentDetails,
                'manual_payment_details' => $manualPaymentDetails,
                'payment_expired_at' => $topup->payment_expired_at?->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
                'created_at' => $topup->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
            ],
            'app_env' => app()->environment(),
        ]);
    }
}
