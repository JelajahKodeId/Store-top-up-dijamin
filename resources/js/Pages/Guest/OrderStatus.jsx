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
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${expired ? 'text-red-400' : 'text-yellow-400'}`}>
            <AppIcons.clock size={13} />
            {expired ? 'Waktu pembayaran habis' : `Bayar sebelum: ${timeLeft}`}
        </div>
    );
}

export default function OrderStatus({ order, flash }) {
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

            <div className="section-container pb-40">
                <div className="max-w-xl mx-auto space-y-5">

                    {/* Flash success message */}
                    {flash?.success && (
                        <div className="p-4 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center gap-3">
                            <AppIcons.success_circle size={16} className="text-green-400 flex-shrink-0" />
                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{flash.success}</p>
                        </div>
                    )}

                    {/* Status Hero Card */}
                    <div className={`p-8 rounded-3xl border ${cfg.bg} ${cfg.border} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20"
                            style={{ background: cfg.dot.replace('bg-', '') }} />

                        <div className="relative z-10 flex items-start gap-5">
                            <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                                <StatusIcon size={26} className={cfg.color} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {cfg.pulse && (
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse flex-shrink-0`} />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                                        {cfg.title}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/50 font-medium leading-relaxed">
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
                        <div className="p-6 rounded-3xl bg-green-400/5 border border-green-400/25 space-y-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] bg-green-400/10 pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-400/15 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                                        <AppIcons.key size={18} className="text-green-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-400">Key / Lisensi Tersedia</p>
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                                            Dikirim langsung ke WhatsApp Anda
                                        </p>
                                    </div>
                                </div>

                                {/* Info privasi */}
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 mb-4">
                                    <div className="flex items-start gap-2.5">
                                        <AppIcons.shield size={13} className="text-green-400/60 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-medium text-white/40 leading-relaxed">
                                            Untuk menjaga privasi, key tidak ditampilkan di halaman ini.
                                            Key lisensi sudah dikirimkan secara eksklusif ke WhatsApp Anda.
                                        </p>
                                    </div>
                                    {order.whatsapp && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <AppIcons.phone size={11} className="text-white/30" />
                                            <span className="text-[10px] font-mono font-bold text-white/50">{order.whatsapp}</span>
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
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center p-3">
                                        Key telah dikirim via WhatsApp. Periksa chat Anda.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice & Info */}
                    <div className="rounded-3xl bg-store-charcoal-light/30 border border-white/5 overflow-hidden">
                        {/* Header invoice */}
                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Nomor Invoice</p>
                                <p className="text-lg font-bold text-white font-bebas tracking-wide">{order.invoice_code}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Tanggal</p>
                                <p className="text-[10px] font-bold text-white/60">{order.created_at}</p>
                            </div>
                        </div>

                        {/* Row info */}
                        <div className="divide-y divide-white/5">
                            {order.whatsapp && (
                                <div className="px-6 py-3 flex items-center justify-between gap-4">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex-shrink-0">WhatsApp</span>
                                    <span className="text-xs font-bold text-white font-mono">{order.whatsapp}</span>
                                </div>
                            )}
                            {order.customer_name && (
                                <div className="px-6 py-3 flex items-center justify-between gap-4">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex-shrink-0">Nama</span>
                                    <span className="text-xs font-bold text-white">{order.customer_name}</span>
                                </div>
                            )}
                            {order.payment_method && (
                                <div className="px-6 py-3 flex items-center justify-between gap-4">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex-shrink-0">Metode Bayar</span>
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <AppIcons.wallet size={11} className="text-store-accent" />
                                        {order.payment_method}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-3xl bg-store-charcoal-light/30 border border-white/5 overflow-hidden">
                        <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5">
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Produk yang Dipesan</p>
                        </div>

                        {order.items?.map((item, i) => (
                            <div key={i} className="px-6 py-4 border-b border-white/5 last:border-0 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{item.product_name}</p>
                                    <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                                        {item.duration_name} × {item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-store-accent font-bebas flex-shrink-0">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="px-6 py-4 bg-white/[0.02] space-y-2">
                            {order.discount_amount > 0 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-green-400/60 uppercase tracking-widest flex items-center gap-1">
                                        <AppIcons.tag size={9} /> Diskon
                                    </p>
                                    <p className="text-xs font-bold text-green-400">-{formatPrice(order.discount_amount)}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total Pembayaran</p>
                                <p className="text-xl font-bold text-store-accent font-bebas">{formatPrice(order.total_price)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment URL (jika masih unpaid) */}
                    {order.payment_url && order.status === 'unpaid' && (
                        <div className="p-6 rounded-3xl bg-yellow-400/5 border border-yellow-400/20 space-y-4">
                            <p className="text-[9px] font-bold text-yellow-400/60 uppercase tracking-widest flex items-center gap-1.5">
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

                    {/* Auto-refresh indicator */}
                    {shouldPoll && (
                        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-400/5 border border-blue-400/15">
                            <div className="flex items-center gap-2">
                                <AppIcons.refresh size={12} className="text-blue-400/60 animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest">
                                    Status diperbarui otomatis
                                </span>
                            </div>
                            <button
                                onClick={refresh}
                                className="text-[8px] font-bold text-blue-400/50 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1"
                            >
                                {countdown}s <AppIcons.refresh size={9} />
                            </button>
                        </div>
                    )}

                    {/* Navigasi */}
                    <div className="flex items-center gap-3">
                        <Link href={route('home')} className="flex-1">
                            <Button variant="ghost" className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                Kembali ke Beranda
                            </Button>
                        </Link>
                        <Link href={route('track-invoice')}>
                            <Button variant="ghost" className="py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
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
                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 justify-center hover:bg-white/[0.04] hover:border-store-accent/20 transition-all group"
                        >
                            <AppIcons.help size={15} className="text-store-accent group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center">
                                Butuh bantuan? Hubungi CS via WhatsApp — invoice{' '}
                                <span className="text-white/60 group-hover:text-store-accent transition-colors">{order.invoice_code}</span>
                            </p>
                        </a>
                    ) : (
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 justify-center">
                            <AppIcons.help size={15} className="text-store-accent" />
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center">
                                Butuh bantuan? Hubungi Customer Service dengan menyertakan invoice{' '}
                                <span className="text-white/60">{order.invoice_code}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
