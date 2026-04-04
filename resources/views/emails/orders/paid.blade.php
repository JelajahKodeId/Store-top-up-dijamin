@extends('emails.layout')

@section('header_badge', 'Pembayaran Berhasil')

@section('content')
    <div class="greeting">Halo, {{ $order->customer_name }}! 👋</div>
    <p class="message-text">
        Pembayaran untuk pesanan <strong>#{{ $order->invoice_code }}</strong> telah kami terima.<br>
        Tim kami akan segera memproses pengiriman key produk Anda.
    </p>

    <span class="status-badge badge-paid">✅ Pembayaran Diterima</span>

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
        <div class="detail-row">
            <span class="detail-label">Metode Bayar</span>
            <span class="detail-value uppercase">{{ $order->payment_method }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Bayar</span>
            <span class="detail-value highlight">Rp {{ number_format($order->total_price, 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="alert-box alert-success">
        🚀 <strong>Sabar ya!</strong> Produk Anda sedang dalam proses pengambilan dari stok sistem.
        Kami akan mengirimkan notifikasi baru saat key sudah siap.
    </div>

    <div class="center">
        <a href="{{ config('app.url') }}/orders/{{ $order->invoice_code }}" class="btn-cta">
            Cek Status Pesanan →
        </a>
    </div>
@endsection
