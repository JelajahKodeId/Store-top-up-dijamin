<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulasi Top Up — {{ $topup->invoice_code }}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #1E2028;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            background: #252830;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 1.25rem;
            width: 100%;
            max-width: 440px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .card-header {
            background: #1E2028;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 1.5rem 1.75rem;
        }
        .badge-dev {
            background: rgba(250,204,21,0.1);
            border: 1px solid rgba(250,204,21,0.3);
            color: #FACC15;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            padding: 3px 8px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 6px;
        }
        .card-header h1 {
            font-size: 1.1rem;
            font-weight: 800;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .card-body { padding: 1.5rem 1.75rem; }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            padding: 0.7rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: rgba(255,255,255,0.3);
        }
        .info-value {
            font-size: 12px;
            font-weight: 700;
            color: white;
            text-align: right;
        }
        .info-value.accent { color: #FACC15; font-size: 1.1rem; }
        .info-value.mono { font-family: 'Courier New', monospace; font-size: 11px; }
        .card-footer { padding: 1.25rem 1.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .notice {
            background: rgba(250,204,21,0.06);
            border: 1px solid rgba(250,204,21,0.15);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(250,204,21,0.7);
            text-align: center;
        }
        .btn-pay {
            display: block;
            width: 100%;
            background: #FACC15;
            color: #13151C;
            border: none;
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
        }
        .btn-pay:hover { filter: brightness(1.1); }
        .btn-cancel {
            display: block;
            width: 100%;
            background: transparent;
            color: rgba(255,255,255,0.3);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem;
            padding: 0.75rem 1.5rem;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            margin-top: 0.6rem;
        }
        .status-badge {
            background: @if($topup->status === 'pending') rgba(250,204,21,0.1) @else rgba(34,197,94,0.1) @endif;
            border: 1px solid @if($topup->status === 'pending') rgba(250,204,21,0.3) @else rgba(34,197,94,0.3) @endif;
            color: @if($topup->status === 'pending') #FACC15 @else #4ADE80 @endif;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            padding: 3px 10px;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <div class="badge-dev">🧪 Development Only</div>
            <h1>Simulasi Top Up Saldo</h1>
        </div>
        <div class="card-body">
            <div class="info-row">
                <span class="info-label">Invoice</span>
                <span class="info-value mono">{{ $topup->invoice_code }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span><span class="status-badge">{{ strtoupper($topup->status) }}</span></span>
            </div>
            <div class="info-row">
                <span class="info-label">Nominal</span>
                <span class="info-value accent">
                    Rp {{ number_format((float) $topup->amount, 0, ',', '.') }}
                </span>
            </div>
        </div>
        <div class="card-footer">
            @if($topup->status === 'pending')
                <div class="notice">⚡ Klik untuk mensimulasikan pembayaran sukses</div>
                <a href="{{ route('webhooks.mock', $invoiceCode) }}" class="btn-pay">✓ Bayar Sekarang (Simulasi)</a>
            @else
                <div class="notice" style="color:rgba(74,222,128,0.7);border-color:rgba(74,222,128,0.2);background:rgba(74,222,128,0.05)">
                    ✓ Top up ini sudah diproses
                </div>
            @endif
            <a href="{{ route('member.topup.show', $invoiceCode) }}" class="btn-cancel">← Status Top Up</a>
        </div>
    </div>
</body>
</html>
