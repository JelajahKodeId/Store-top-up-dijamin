@extends('emails.layout')

@section('header_badge', 'Pesanan Gagal')

@section('content')
    <div class="greeting">Halo, {{ $order->customer_name }}! 👋</div>
    <p class="message-text">
        Kami menginformasikan bahwa pesanan <strong>#{{ $order->invoice_code }}</strong> anda telah gagal / dibatalkan.
    </p>

    <span class="status-badge badge-failed">❌ Pesanan Gagal</span>

    <div class="order-card">
        <div class="order-card-title">📦 Detail Pesanan</div>

        <div class="detail-row">
            <span class="detail-label">Invoice</span>
            <span class="detail-value trx-id">{{ $order->invoice_code }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Alasan</span>
            <span class="detail-value text-red">{{ $order->note ?? 'Waktu pembayaran habis atau dibatalkan oleh admin.' }}</span>
        </div>
    </div>

    <div class="alert-box alert-warning">
        🤔 <strong>Ada masalah?</strong> Jika Anda merasa sudah melakukan pembayaran namun pesanan gagal,
        silakan hubungi dukungan pelanggan kami via WhatsApp.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}" class="btn-cta">
            Kembali Belanja →
        </a>
    </div>
@endsection
