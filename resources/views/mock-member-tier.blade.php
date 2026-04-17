<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulasi Upgrade Paket — {{ $upgrade->invoice_code }}</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: ui-sans-serif, system-ui, 'Segoe UI', sans-serif;
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
            letter-spacing: 0.12em;
            padding: 3px 8px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 6px;
        }
        .card-header h1 {
            font-size: 1.05rem;
            font-weight: 700;
            color: white;
            letter-spacing: 0.02em;
        }
        .card-body { padding: 1.5rem 1.75rem; }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            padding: 0.65rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
            font-size: 11px;
            font-weight: 600;
            color: rgba(255,255,255,0.45);
        }
        .info-value {
            font-size: 13px;
            font-weight: 600;
            color: white;
            text-align: right;
        }
        .info-value.accent { color: #FACC15; font-size: 1.05rem; font-weight: 700; }
        .info-value.mono { font-family: ui-monospace, monospace; font-size: 11px; }
        .card-footer { padding: 1.25rem 1.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .notice {
            background: rgba(250,204,21,0.06);
            border: 1px solid rgba(250,204,21,0.15);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            font-size: 11px;
            font-weight: 600;
            color: rgba(250,204,21,0.75);
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
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.04em;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
        }
        .btn-pay:hover { filter: brightness(1.08); }
        .btn-cancel {
            display: block;
            width: 100%;
            background: transparent;
            color: rgba(255,255,255,0.35);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem;
            padding: 0.75rem 1.5rem;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            margin-top: 0.6rem;
        }
        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .status-pending { background: rgba(250,204,21,0.12); color: #FACC15; border: 1px solid rgba(250,204,21,0.25); }
        .status-done { background: rgba(34,197,94,0.12); color: #4ADE80; border: 1px solid rgba(34,197,94,0.25); }
    </style>
</head>
<body>
    <div class="card">
        <div class="card-header">
            <div class="badge-dev">Development only</div>
            <h1>Simulasi pembayaran upgrade paket</h1>
        </div>
        <div class="card-body">
            <div class="info-row">
                <span class="info-label">Invoice</span>
                <span class="info-value mono">{{ $upgrade->invoice_code }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Paket</span>
                <span class="info-value">{{ $upgrade->target_tier->label() }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span>
                    <span class="status-badge {{ $upgrade->status === 'pending' ? 'status-pending' : 'status-done' }}">{{ $upgrade->status }}</span>
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Total</span>
                <span class="info-value accent">
                    Rp {{ number_format((float) $upgrade->amount, 0, ',', '.') }}
                </span>
            </div>
        </div>
        <div class="card-footer">
            @if($upgrade->status === 'pending')
                <div class="notice">Klik di bawah untuk mensimulasikan pembayaran sukses</div>
                <a href="{{ route('webhooks.mock', $invoiceCode) }}" class="btn-pay">Bayar sekarang (simulasi)</a>
            @else
                <div class="notice" style="color:rgba(74,222,128,0.85);border-color:rgba(74,222,128,0.25);background:rgba(74,222,128,0.06)">
                    Transaksi ini sudah diproses
                </div>
            @endif
            <a href="{{ route('member.packages.show', $invoiceCode) }}" class="btn-cancel">← Status upgrade</a>
        </div>
    </div>
</body>
</html>
