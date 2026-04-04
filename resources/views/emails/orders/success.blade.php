@extends('emails.layout')

@section('header_badge', 'Key Berhasil Terkirim')

@section('content')
    <div class="greeting">Halo, {{ $order->customer_name }}! 👋</div>
    <p class="message-text">
        Pesanan <strong>#{{ $order->invoice_code }}</strong> Anda telah berhasil diproses.<br>
        Berikut adalah detail serial key / lisensi produk Anda:
    </p>

    <span class="status-badge badge-success">💎 Pesanan Selesai</span>

    <div class="order-card">
        <div class="order-card-title">🔑 Serial Key / Lisensi</div>

        @foreach($order->items as $item)
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px dashed #cbd5e1;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 5px;">
                    {{ $item->product_name }} ({{ $item->duration_name }})
                </div>
                @foreach($item->orderKeys as $key)
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; color: #1e293b; letter-spacing: 1px;">
                        {{ $key->key_code }}
                    </div>
                @endforeach
            </div>
        @endforeach
    </div>

    @if($order->fieldValues->count() > 0)
    <div class="order-card" style="margin-top: 15px;">
        <div class="order-card-title">📦 Detail Akun</div>
        @foreach($order->fieldValues as $fv)
            <div class="detail-row">
                <span class="detail-label">{{ $fv->field_name }}</span>
                <span class="detail-value">{{ $fv->field_value }}</span>
            </div>
        @endforeach
    </div>
    @endif

    <div class="alert-box alert-success">
        📖 <strong>Tips:</strong> Salin key di atas dan masukkan ke dalam aplikasi / game yang sesuai.
        Jika ada kendala, hubungi WhatsApp kami.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->invoice_code }}" class="btn-cta">
            Invoice Detail →
        </a>
    </div>
@endsection
