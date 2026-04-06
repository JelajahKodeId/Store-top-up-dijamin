<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulasi Pembayaran — {{ $order->invoice_code }}</title>
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
            display: flex;
            align-items: center;
            gap: 0.75rem;
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
            flex-shrink: 0;
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
            transition: filter 0.2s;
            box-shadow: 0 0 20px rgba(250,204,21,0.2);
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
            transition: all 0.2s;
        }
        .btn-cancel:hover {
            color: rgba(255,255,255,0.6);
            border-color: rgba(255,255,255,0.2);
        }

        .method-badge {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.5rem;
            padding: 3px 10px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: rgba(255,255,255,0.6);
        }

        .status-badge {
            background: @if($order->status->value === 'unpaid') rgba(250,204,21,0.1) @else rgba(34,197,94,0.1) @endif;
            border: 1px solid @if($order->status->value === 'unpaid') rgba(250,204,21,0.3) @else rgba(34,197,94,0.3) @endif;
            color: @if($order->status->value === 'unpaid') #FACC15 @else #4ADE80 @endif;
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
            <div>
                <div class="badge-dev" style="margin-bottom:6px">🧪 Development Only</div>
                <h1>Simulasi Pembayaran</h1>
            </div>
        </div>

        <div class="card-body">
            <div class="info-row">
                <span class="info-label">Invoice</span>
                <span class="info-value mono">{{ $order->invoice_code }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Produk</span>
                <span class="info-value">{{ $order->items->first()?->product_name ?? '-' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Paket</span>
                <span class="info-value">{{ $order->items->first()?->duration_name ?? '-' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">WhatsApp</span>
                <span class="info-value mono">{{ $order->whatsapp_number ?? '-' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Metode</span>
                <span class="method-badge">{{ $order->payment_method ?? 'QRIS' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="status-badge">{{ $order->status->label() }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total Bayar</span>
                <span class="info-value accent">
                    Rp {{ number_format((float)$order->total_price, 0, ',', '.') }}
                </span>
            </div>
        </div>

        <div class="card-footer">
            @if($order->status->value === 'unpaid')
                <div class="notice">
                    ⚡ Klik tombol di bawah untuk mensimulasikan pembayaran sukses
                </div>
                <a href="{{ route('webhooks.mock', $invoiceCode) }}" class="btn-pay">
                    ✓ Bayar Sekarang (Simulasi)
                </a>
            @else
                <div class="notice" style="color:rgba(74,222,128,0.7);border-color:rgba(74,222,128,0.2);background:rgba(74,222,128,0.05)">
                    ✓ Pesanan ini sudah diproses
                </div>
            @endif
            <a href="{{ route('orders.status', $invoiceCode) }}" class="btn-cancel">
                ← Lihat Status Pesanan
            </a>
        </div>
    </div>
</body>
</html>
