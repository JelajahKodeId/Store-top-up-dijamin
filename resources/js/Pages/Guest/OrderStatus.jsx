import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';
import { formatPrice, toWaLink, orderStatusConfig as statusConfig } from '@/utils/guest';

function CountdownTimer({ expiredAt }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        if (!expiredAt) return;

        const interval = setInterval(() => {
            const diff = new Date(expiredAt) - new Date();
            if (diff <= 0) {
                setExpired(true);
                setTimeLeft('Kadaluarsa');
                clearInterval(interval);
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiredAt]);

    if (!expiredAt) return null;

    return (
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide ${expired ? 'text-red-600' : 'text-amber-700'}`}>
            <AppIcons.clock size={13} />
            {expired ? 'Waktu pembayaran habis' : `Bayar sebelum: ${timeLeft}`}
        </div>
    );
}

export default function OrderStatus({ order, flash, app_env }) {
    const { site } = usePage().props;
    const cfg = statusConfig[order.status] ?? statusConfig.failed;
    const StatusIcon = AppIcons[cfg.icon] ?? AppIcons.info;

    // Auto-refresh saat status masih unpaid/paid (polling setiap 10 detik)
    const shouldPoll = ['unpaid', 'paid'].includes(order.status);
    const [countdown, setCountdown] = useState(10);

    const refresh = useCallback(() => {
        router.reload({ only: ['order'] });
        setCountdown(10);
    }, []);

    useEffect(() => {
        if (!shouldPoll) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { refresh(); return 10; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [shouldPoll, refresh]);

    // WA customer → untuk tombol "Buka WhatsApp lihat key"
    const waLink = toWaLink(order.whatsapp);
    // WA CS admin → untuk tombol bantuan
    const csWaLink = site?.whatsapp ? toWaLink(site.whatsapp) : null;
    const isSuccess = order.status === 'success';

    return (
        <GuestLayout title="Status Pesanan" subtitle={`Invoice #${order.invoice_code}`}>
            <Head title={`Status Pesanan #${order.invoice_code} — Mall Store`} />

            <div className="section-container pb-12 sm:pb-16">
                <div className="mx-auto max-w-xl space-y-4">

                    {/* Flash success message */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                            <AppIcons.success_circle size={16} className="flex-shrink-0 text-green-600" />
                            <p className="text-[10px] font-bold uppercase tracking-wide text-green-800">{flash.success}</p>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <AppIcons.error size={16} className="flex-shrink-0 text-red-600" />
                            <p className="text-[10px] font-bold uppercase tracking-wide leading-normal text-red-800">{flash.error}</p>
                        </div>
                    )}

                    {order.status === 'unpaid' && order.needs_payment_help && (
                        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                                <AppIcons.help size={14} /> Pembayaran belum siap
                            </p>
                            <p className="text-[10px] font-medium leading-normal text-guest-muted">
                                Sesi bayar tidak bisa dibuka (misalnya kunci Midtrans atau URL pembayaran kosong). Simpan invoice{' '}
                                <span className="font-mono text-guest-text">{order.invoice_code}</span> dan hubungi CS bantuan.
                            </p>
                        </div>
                    )}

                    {/* Status Hero Card */}
                    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft sm:p-6 md:p-7 ${cfg.bg} ${cfg.border}`}>
                        <div className={`pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full blur-[80px] opacity-25 ${cfg.dot}`} />

                        <div className="relative z-10 flex items-start gap-5">
                            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border bg-guest-surface ${cfg.border}`}>
                                <StatusIcon size={26} className={cfg.color} strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    {cfg.pulse && (
                                        <span className={`h-2 w-2 flex-shrink-0 animate-pulse rounded-full ${cfg.dot}`} />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                                        {cfg.title}
                                    </span>
                                    {order.midtrans_is_sandbox && (
                                        <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-900">
                                            Sandbox
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] font-medium leading-normal text-guest-muted">
                                    {cfg.desc}
                                </p>
                                {order.payment_expired_at && order.status === 'unpaid' && (
                                    <div className="mt-3">
                                        <CountdownTimer expiredAt={order.payment_expired_at} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Key Delivery Card (hanya tampil jika success) ───────── */}
                    {isSuccess && (
                        <div className="relative space-y-5 overflow-hidden rounded-3xl border border-green-200 bg-green-50/80 p-6 shadow-soft">
                            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-green-300/30 blur-[60px]" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-green-300 bg-guest-surface">
                                        <AppIcons.key size={18} className="text-green-700" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-800">Key / Lisensi Tersedia</p>
                                        <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-guest-subtle">
                                            Dikirim langsung ke WhatsApp Anda
                                        </p>
                                    </div>
                                </div>

                                {/* Info privasi */}
                                <div className="mb-4 space-y-2 rounded-2xl border border-guest-border bg-guest-surface p-4">
                                    <div className="flex items-start gap-2.5">
                                        <AppIcons.shield size={13} className="mt-0.5 flex-shrink-0 text-green-600/80" />
                                        <p className="text-[11px] font-medium leading-normal text-guest-muted">
                                            Untuk menjaga privasi, key tidak ditampilkan di halaman ini.
                                            Key lisensi sudah dikirimkan secara eksklusif ke WhatsApp Anda.
                                        </p>
                                    </div>
                                    {order.whatsapp && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <AppIcons.phone size={11} className="text-guest-subtle" />
                                            <span className="text-[10px] font-mono font-bold text-guest-text">{order.whatsapp}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol buka WA */}
                                {waLink ? (
                                    <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 text-store-dark text-xs font-black uppercase tracking-[0.15em] transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.35)] hover:scale-[1.01] active:scale-[0.98]"
                                    >
                                        <AppIcons.phone size={15} strokeWidth={2.5} />
                                        Buka WhatsApp — Lihat Key
                                        <AppIcons.arrowRight size={14} strokeWidth={2.5} />
                                    </a>
                                ) : (
                                    <p className="p-3 text-center text-sm font-medium text-guest-muted">
                                        Key telah dikirim via WhatsApp. Periksa chat Anda.
                                    </p>
                                )}

                                {(() => {
                                    const seen = new Set();
                                    const rows = (order.items ?? []).filter((it) => {
                                        if (!it.product_slug || seen.has(it.product_slug)) return false;
                                        seen.add(it.product_slug);
                                        return true;
                                    });
                                    if (!rows.length) return null;
                                    return (
                                        <div className="mt-5 space-y-3 rounded-2xl border border-guest-border bg-guest-surface p-4">
                                            <p className="text-sm font-semibold text-guest-text">Beri ulasan pembelian</p>
                                            <p className="text-sm leading-normal text-guest-muted">
                                                Bagikan rating untuk produk yang Anda beli. Invoice Anda sudah terisi otomatis di form.
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                {rows.map((it) => (
                                                    <Link
                                                        key={it.product_slug}
                                                        href={`/products/${it.product_slug}?invoice=${encodeURIComponent(order.invoice_code)}`}
                                                        className="flex items-center justify-center gap-2 rounded-xl bg-store-accent/15 px-4 py-3 text-sm font-semibold text-amber-950 transition-colors hover:bg-store-accent/25"
                                                    >
                                                        <AppIcons.star size={16} className="shrink-0 text-amber-600" strokeWidth={2.5} />
                                                        <span className="truncate">Ulasan: {it.product_name}</span>
                                                        <AppIcons.arrowRight size={14} className="shrink-0" strokeWidth={2.5} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Invoice & Info */}
                    <div className="overflow-hidden rounded-3xl border border-guest-border bg-guest-surface shadow-soft">
                        {/* Header invoice */}
                        <div className="flex items-center justify-between border-b border-guest-border bg-guest-elevated px-6 py-4">
                            <div>
                                <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-guest-subtle">Nomor Invoice</p>
                                <p className="font-bebas text-lg font-bold tracking-wide text-guest-text">{order.invoice_code}</p>
                            </div>
                            <div className="text-right">
                                <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-guest-subtle">Tanggal</p>
                                <p className="text-[10px] font-bold text-guest-muted">{order.created_at}</p>
                            </div>
                        </div>

                        {/* Row info */}
                        <div className="divide-y divide-guest-border">
                            {order.whatsapp && (
                                <div className="flex items-center justify-between gap-4 px-6 py-3">
                                    <span className="flex-shrink-0 text-sm font-bold uppercase tracking-wide text-guest-subtle">WhatsApp</span>
                                    <span className="font-mono text-xs font-bold text-guest-text">{order.whatsapp}</span>
                                </div>
                            )}
                            {order.customer_name && (
                                <div className="flex items-center justify-between gap-4 px-6 py-3">
                                    <span className="flex-shrink-0 text-sm font-bold uppercase tracking-wide text-guest-subtle">Nama</span>
                                    <span className="text-xs font-bold text-guest-text">{order.customer_name}</span>
                                </div>
                            )}
                            {(order.payment_method_label || order.payment_method) && (
                                <div className="flex items-center justify-between gap-4 px-6 py-3">
                                    <span className="flex-shrink-0 text-sm font-bold uppercase tracking-wide text-guest-subtle">Metode Bayar</span>
                                    <span className="flex items-center gap-1.5 text-right text-xs font-bold text-guest-text">
                                        <AppIcons.wallet size={11} className="flex-shrink-0 text-store-accent" />
                                        {order.payment_method_label || order.payment_method}
                                    </span>
                                </div>
                            )}
                            {order.payment_gateway && (
                                <div className="flex items-center justify-between gap-4 px-6 py-3">
                                    <span className="flex-shrink-0 text-sm font-bold uppercase tracking-wide text-guest-subtle">Gateway</span>
                                    <span className="font-mono text-[10px] font-bold uppercase text-guest-muted">{order.payment_gateway}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="overflow-hidden rounded-3xl border border-guest-border bg-guest-surface shadow-soft">
                        <div className="border-b border-guest-border bg-guest-elevated px-6 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Produk yang Dipesan</p>
                        </div>

                        {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 border-b border-guest-border px-6 py-4 last:border-0">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-guest-text">{item.product_name}</p>
                                    <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-guest-muted">
                                        {item.duration_name} × {item.quantity}
                                    </p>
                                </div>
                                <p className="flex-shrink-0 font-bebas text-sm font-bold text-store-accent">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="space-y-2 bg-guest-elevated px-6 py-4">
                            {order.discount_amount > 0 && (
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-green-700">
                                        <AppIcons.tag size={9} /> Diskon
                                    </p>
                                    <p className="text-xs font-bold text-green-700">-{formatPrice(order.discount_amount)}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold uppercase tracking-wide text-guest-subtle">Total Pembayaran</p>
                                <p className="font-bebas text-xl font-bold text-store-accent">{formatPrice(order.total_price)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Midtrans Snap (prioritas) */}
                    {order.status === 'unpaid' && order.midtrans_snap_token && order.midtrans_client_key && order.midtrans_snap_js && (
                        <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-soft">
                            <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-amber-900">
                                <AppIcons.wallet size={11} strokeWidth={2.5} />
                                Lanjutkan Pembayaran (Midtrans)
                            </p>
                            <p className="text-[10px] font-medium leading-normal text-guest-muted">
                                QRIS, transfer VA, kartu, dan e-wallet dipilih di jendela pembayaran Midtrans.
                            </p>
                            <Button
                                type="button"
                                variant="accent"
                                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.15em]"
                                onClick={async () => {
                                    try {
                                        await new Promise((resolve, reject) => {
                                            if (typeof window !== 'undefined' && window.snap) {
                                                resolve();
                                                return;
                                            }
                                            const existing = document.querySelector('script[data-midtrans-snap]');
                                            if (existing) {
                                                existing.addEventListener('load', () => resolve());
                                                existing.addEventListener('error', reject);
                                                return;
                                            }
                                            const s = document.createElement('script');
                                            s.src = order.midtrans_snap_js;
                                            s.setAttribute('data-client-key', order.midtrans_client_key);
                                            s.setAttribute('data-midtrans-snap', '1');
                                            s.onload = () => resolve();
                                            s.onerror = () => reject(new Error('Gagal memuat Snap'));
                                            document.body.appendChild(s);
                                        });
                                        window.snap.pay(order.midtrans_snap_token, {
                                            onSuccess: () => router.reload({ only: ['order'] }),
                                            onPending: () => router.reload({ only: ['order'] }),
                                            onClose: () => { },
                                        });
                                    } catch {
                                        alert('Gagal memuat pembayaran Midtrans. Coba refresh halaman.');
                                    }
                                }}
                            >
                                Bayar dengan Midtrans
                            </Button>
                        </div>
                    )}

                    {/* Pak Kasir Direct Details (VA / QRIS) */}
                    {order.status === 'unpaid' && order.pak_kasir_details && (
                        <div className="relative space-y-5 overflow-hidden rounded-3xl border border-guest-border bg-guest-surface p-6 shadow-soft">
                            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-store-accent/15 blur-[60px]" />

                            <div className="relative z-10">
                                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-store-accent">
                                    Instruksi Pembayaran
                                </p>

                                {order.pak_kasir_details.is_qris ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="rounded-2xl border-4 border-guest-border bg-white p-4 shadow-card">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.pak_kasir_details.number)}`}
                                                alt="QRIS Code"
                                                className="mx-auto block h-48 w-48"
                                            />
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-xs font-bold text-guest-text">QRIS All Payment</p>
                                            <p className="text-[10px] font-medium leading-normal text-guest-muted">
                                                Scan QR di atas menggunakan aplikasi m-banking atau e-wallet (Gojek, Dana, Shopee, dll).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="group space-y-1.5 rounded-2xl border border-guest-border bg-guest-elevated p-5">
                                            <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">
                                                Nomor {order.pak_kasir_details.method?.toUpperCase() || 'VA'}
                                            </p>
                                            <div className="flex items-center justify-between gap-4">
                                                <p className="break-all font-mono text-2xl font-bold leading-tight tracking-wider text-guest-text">
                                                    {order.pak_kasir_details.number}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        const el = document.createElement('textarea');
                                                        el.value = order.pak_kasir_details.number;
                                                        document.body.appendChild(el);
                                                        el.select();
                                                        document.execCommand('copy');
                                                        document.body.removeChild(el);
                                                        alert('Nomor berhasil disalin!');
                                                    }}
                                                    className="flex-shrink-0 rounded-xl border border-guest-border bg-guest-surface p-3 text-guest-muted transition-all hover:border-store-accent hover:bg-store-accent hover:text-store-dark active:scale-95"
                                                >
                                                    <AppIcons.copy size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-guest-border bg-guest-elevated p-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Total Bayar</p>
                                                <p className="font-bebas text-lg font-bold text-store-accent">{formatPrice(order.pak_kasir_details.total_payment)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment URL (Tripay / redirect lain, jika tidak pakai Snap) */}
                    {order.payment_url && order.status === 'unpaid' && !order.midtrans_snap_token && (
                        <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-soft">
                            <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-amber-900">
                                <AppIcons.wallet size={11} strokeWidth={2.5} />
                                Lanjutkan Pembayaran
                            </p>
                            <a
                                href={order.payment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button variant="accent" className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.15em]">
                                    Bayar Sekarang →
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* Pak Kasir Simulation (Development Only) */}
                    {order.status === 'unpaid' && order.payment_gateway === 'pak_kasir' && app_env === 'local' && (
                        <div className="space-y-4 rounded-3xl border border-blue-200 bg-blue-50/80 p-6 shadow-soft">
                            <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-blue-900">
                                <AppIcons.refresh size={11} strokeWidth={2.5} />
                                Simulasi Pembayaran (Pak Kasir)
                            </p>
                            <p className="text-[10px] font-medium leading-normal text-guest-muted">
                                Klik tombol di bawah untuk mensimulasikan status <b>PAID</b> via API Pak Kasir.
                            </p>
                            <Link href={route('webhooks.pak-kasir-simulate', order.invoice_code)}>
                                <Button variant="accent" className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.15em]">
                                    Simulasi Bayar Sekarang
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Auto-refresh indicator */}
                    {shouldPoll && (
                        <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <AppIcons.refresh size={12} className="animate-spin text-blue-700" style={{ animationDuration: '3s' }} />
                                <span className="text-sm font-bold uppercase tracking-wide text-blue-900">
                                    Status diperbarui otomatis
                                </span>
                            </div>
                            <button
                                onClick={refresh}
                                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-blue-700 transition-colors hover:text-blue-900"
                            >
                                {countdown}s <AppIcons.refresh size={9} />
                            </button>
                        </div>
                    )}

                    {/* Navigasi */}
                    <div className="flex items-center gap-3">
                        <Link href={route('home')} className="flex-1">
                            <Button variant="guestGhost" className="w-full rounded-xl border border-guest-border py-2.5 text-[10px] font-bold uppercase tracking-wide">
                                Kembali ke Beranda
                            </Button>
                        </Link>
                        <Link href={route('track-invoice')}>
                            <Button variant="guestGhost" className="rounded-xl border border-guest-border px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide">
                                Lacak Lagi
                            </Button>
                        </Link>
                    </div>

                    {/* Help — gunakan WA CS Admin dari settings, bukan WA customer */}
                    {csWaLink ? (
                        <a
                            href={`${csWaLink}?text=${encodeURIComponent(`Halo CS, saya butuh bantuan untuk pesanan ${order.invoice_code}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-3 rounded-2xl border border-guest-border bg-guest-surface p-5 shadow-soft transition-all hover:border-store-accent/30 hover:bg-guest-elevated"
                        >
                            <AppIcons.help size={15} className="text-store-accent transition-transform group-hover:scale-110" />
                            <p className="text-center text-sm font-bold uppercase tracking-wide text-guest-subtle">
                                Butuh bantuan? Hubungi CS via WhatsApp — invoice{' '}
                                <span className="text-guest-text transition-colors group-hover:text-store-accent">{order.invoice_code}</span>
                            </p>
                        </a>
                    ) : (
                        <div className="flex items-center justify-center gap-3 rounded-2xl border border-guest-border bg-guest-surface p-5 shadow-soft">
                            <AppIcons.help size={15} className="text-store-accent" />
                            <p className="text-center text-sm font-bold uppercase tracking-wide text-guest-subtle">
                                Butuh bantuan? Hubungi Customer Service dengan menyertakan invoice{' '}
                                <span className="text-guest-text">{order.invoice_code}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
