@extends('emails.layout')

@section('header_badge', 'Pesanan Baru')

@section('content')
    <div class="greeting">Halo, {{ $order->customer_name }}! 👋</div>
    <p class="message-text">
        Terima kasih telah memesan di <strong>{{ config('app.name') }}</strong>.<br>
        Pesanan Anda telah berhasil dibuat dan menunggu pembayaran.
    </p>

    <span class="status-badge badge-unpaid">⏳ Menunggu Pembayaran</span>

    <div class="order-card">
        <div class="order-card-title">📦 Detail Pesanan</div>

        <div class="detail-row">
            <span class="detail-label">Invoice</span>
            <span class="detail-value trx-id">{{ $order->invoice_code }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Item</span>
            <span class="detail-value">
                @foreach($order->items as $item)
                    {{ $item->product_name }} - {{ $item->duration_name }}{{ !$loop->last ? ', ' : '' }}
                @endforeach
            </span>
        </div>
        @if($order->fieldValues->count() > 0)
        <div class="detail-row">
            <span class="detail-label">Data Akun</span>
            <span class="detail-value">
                @foreach($order->fieldValues as $fv)
                    {{ $fv->field_name }}: {{ $fv->field_value }}{{ !$loop->last ? ' | ' : '' }}
                @endforeach
            </span>
        </div>
        @endif
        <div class="detail-row">
            <span class="detail-label">Metode Bayar</span>
            <span class="detail-value uppercase">{{ $order->payment_method }}</span>
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
        <a href="{{ config('app.url') }}/orders/{{ $order->invoice_code }}" class="btn-cta">
            Bayar Sekarang →
        </a>
    </div>

    <hr class="divider">

    <p style="font-size: 13px; color: #64748b; text-align: center;">
        Simpan Kode Invoice Anda: <strong style="color: #818cf8;">{{ $order->invoice_code }}</strong><br>
        untuk keperluan pengecekan status pesanan.
    </p>
@endsection
