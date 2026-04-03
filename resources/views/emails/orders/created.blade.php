@extends('emails.layout')

@section('header_badge', 'Pesanan Baru')

@section('content')
    <div class="greeting">Halo, {{ $order->getCustomerName() }}! 👋</div>
    <p class="message-text">
        Terima kasih telah memesan di <strong>{{ config('app.name') }}</strong>.<br>
        Pesanan Anda telah berhasil dibuat dan menunggu pembayaran.
    </p>

    <span class="status-badge badge-unpaid">⏳ Menunggu Pembayaran</span>

    <div class="order-card">
        <div class="order-card-title">📦 Detail Pesanan</div>

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
        <div class="detail-row">
            <span class="detail-label">Tanggal</span>
            <span class="detail-value">{{ $order->created_at->format('d M Y, H:i') }} WIB</span>
        </div>
    </div>

    <div class="alert-box alert-warning">
        ⚠️ <strong>Segera selesaikan pembayaran</strong> sebelum batas waktu yang ditentukan.
        Pesanan yang tidak dibayar akan otomatis dibatalkan oleh sistem.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->trx_id }}" class="btn-cta">
            Bayar Sekarang →
        </a>
    </div>

    <hr class="divider">

    <p style="font-size: 13px; color: #64748b; text-align: center;">
        Simpan ID Transaksi Anda: <strong style="color: #818cf8;">{{ $order->trx_id }}</strong><br>
        untuk keperluan pengecekan status pesanan.
    </p>
@endsection
