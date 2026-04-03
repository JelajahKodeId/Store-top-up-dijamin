@extends('emails.layout')

@section('header_badge', 'Transaksi Gagal')

@section('content')
    <div class="greeting">Transaksi Gagal/Dibatalkan ❌</div>
    <p class="message-text">
        Halo <strong>{{ $order->getCustomerName() }}</strong>,<br>
        kami mohon maaf, transaksi Anda <strong>tidak dapat diproses</strong> atau telah dibatalkan.
    </p>

    <span class="status-badge {{ $order->status === 'canceled' ? 'badge-canceled' : 'badge-failed' }}">
        {{ $order->status === 'canceled' ? '🚫 Dibatalkan' : '❌ Gagal' }}
    </span>

    <div class="order-card">
        <div class="order-card-title">📦 Detail Transaksi</div>

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
            <span class="detail-label">Total</span>
            <span class="detail-value">Rp {{ number_format($order->total_price, 0, ',', '.') }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value" style="color: #f87171; font-weight: 700;">
                {{ ucfirst($order->status) }}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Waktu</span>
            <span class="detail-value">{{ $order->updated_at->format('d M Y, H:i') }} WIB</span>
        </div>
    </div>

    @if($order->note)
    <div class="alert-box alert-warning">
        ⚠️ <strong>Keterangan:</strong><br>
        {{ $order->note }}
    </div>
    @endif

    <div class="alert-box alert-danger">
        ❌ Jika Anda sudah melakukan pembayaran namun transaksi ini gagal,
        <strong>jangan khawatir</strong> — dana Anda akan dikembalikan sesuai ketentuan.
        Hubungi tim support kami untuk bantuan lebih lanjut.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->trx_id }}" class="btn-cta">
            Pesan Ulang →
        </a>
    </div>

    <hr class="divider">

    <p style="font-size: 13px; color: #64748b; text-align: center;">
        Butuh bantuan? Hubungi kami di
        <a href="mailto:support@mallstore.id" style="color: #6366f1;">support@mallstore.id</a><br>
        atau chat via WhatsApp di jam kerja (09.00–21.00 WIB)
    </p>
@endsection
