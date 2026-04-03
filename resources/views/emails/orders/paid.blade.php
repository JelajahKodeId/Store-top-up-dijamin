@extends('emails.layout')

@section('header_badge', 'Pembayaran Dikonfirmasi')

@section('content')
    <div class="greeting">Pembayaran Berhasil! ✅</div>
    <p class="message-text">
        Halo <strong>{{ $order->getCustomerName() }}</strong>,<br>
        pembayaran untuk pesanan Anda telah kami terima dan <strong>sedang diproses</strong>.
    </p>

    <span class="status-badge badge-paid">✅ Pembayaran Diterima</span>

    <div class="order-card">
        <div class="order-card-title">📦 Ringkasan Pesanan</div>

        <div class="detail-row">
            <span class="detail-label">ID Transaksi</span>
            <span class="detail-value trx-id">{{ $order->trx_id }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Produk</span>
            <span class="detail-value">{{ $order->product?->name ?? '-' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ID Akun</span>
            <span class="detail-value">{{ $order->target_id }}{{ $order->zone_id ? " / {$order->zone_id}" : '' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Metode Bayar</span>
            <span class="detail-value">{{ $order->paymentMethod?->name ?? '-' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Bayar</span>
            <span class="detail-value highlight">Rp {{ number_format($order->total_price, 0, ',', '.') }}</span>
        </div>
        @if($order->reference)
        <div class="detail-row">
            <span class="detail-label">Referensi PG</span>
            <span class="detail-value trx-id">{{ $order->reference }}</span>
        </div>
        @endif
        <div class="detail-row">
            <span class="detail-label">Waktu Bayar</span>
            <span class="detail-value">{{ $order->updated_at->format('d M Y, H:i') }} WIB</span>
        </div>
    </div>

    <div class="alert-box alert-info">
        ℹ️ <strong>Tim kami sedang memproses top-up Anda.</strong><br>
        Proses biasanya selesai dalam <strong>1–15 menit</strong>.
        Anda akan mendapat email konfirmasi setelah top-up berhasil dikirimkan.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->trx_id }}" class="btn-cta">
            Cek Status Pesanan →
        </a>
    </div>
@endsection
