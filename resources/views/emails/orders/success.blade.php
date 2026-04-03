@extends('emails.layout')

@section('header_badge', 'Top-up Berhasil 🎉')

@section('content')
    <div class="greeting">Top-up Berhasil Terkirim! 🎉</div>
    <p class="message-text">
        Halo <strong>{{ $order->getCustomerName() }}</strong>,<br>
        top-up Anda telah berhasil dikirimkan ke akun yang dituju. Terima kasih!
    </p>

    <span class="status-badge badge-success">🎉 Berhasil</span>

    <div class="order-card">
        <div class="order-card-title">🧾 Bukti Transaksi</div>

        <div class="detail-row">
            <span class="detail-label">ID Transaksi</span>
            <span class="detail-value trx-id">{{ $order->trx_id }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Produk</span>
            <span class="detail-value">{{ $order->product?->name ?? '-' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ID Akun Tujuan</span>
            <span class="detail-value">{{ $order->target_id }}{{ $order->zone_id ? " / {$order->zone_id}" : '' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Metode Bayar</span>
            <span class="detail-value">{{ $order->paymentMethod?->name ?? '-' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Dibayar</span>
            <span class="detail-value highlight">Rp {{ number_format($order->total_price, 0, ',', '.') }}</span>
        </div>
        @if($order->reference)
        <div class="detail-row">
            <span class="detail-label">Referensi PG</span>
            <span class="detail-value trx-id">{{ $order->reference }}</span>
        </div>
        @endif
        <div class="detail-row">
            <span class="detail-label">Waktu Selesai</span>
            <span class="detail-value">{{ $order->updated_at->format('d M Y, H:i') }} WIB</span>
        </div>
    </div>

    <div class="alert-box alert-success">
        ✅ <strong>Transaksi selesai dan tercatat</strong> di sistem kami.<br>
        Simpan email ini sebagai bukti transaksi Anda.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->trx_id }}" class="btn-cta">
            Lihat Detail Transaksi →
        </a>
    </div>

    <hr class="divider">

    <p style="font-size: 13px; color: #64748b; text-align: center;">
        Puas dengan layanan kami? Bagikan ke teman-temanmu! 🙌<br>
        <a href="{{ config('app.url') }}" style="color: #6366f1;">Kunjungi {{ config('app.name') }}</a>
    </p>
@endsection
