import { Head, useForm, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState, useCallback } from 'react';
import GuestInput from '@/Components/guest/GuestInput';
import { formatPrice, productImageSrc } from '@/utils/guest';

function fieldIcon(field) {
    const n = (field.name || field.label || '').toLowerCase();
    const t = (field.type || 'text').toLowerCase();
    if (t === 'email' || n.includes('email')) return 'mail';
    if (t === 'tel' || n.includes('phone') || n.includes('hp') || n.includes('wa') || n.includes('whatsapp')) return 'phone';
    if (t === 'number' || n.includes('id') || n.includes('uid') || n.includes('nomor') || n.includes('number')) return 'hash';
    if (n.includes('user') || n.includes('username') || n.includes('nama') || n.includes('name')) return 'profile';
    if (t === 'textarea' || n.includes('note') || n.includes('catatan') || n.includes('deskripsi')) return 'pencil';
    return 'pencil';
}

// Fallback jika backend tidak mengembalikan channels (dev / mock)
const FALLBACK_BY_GATEWAY = {
    midtrans: [{ code: 'midtrans_snap', label: 'Midtrans (QRIS, VA, E-Wallet)', fee: 0, fee_pct: 0 }],
    tripay: [{ code: 'QRIS', label: 'QRIS (fallback)', fee: 0, fee_pct: 0.7 }],
    mock: [
        { code: 'MOCK_QRIS', label: 'QRIS (Mock)', fee: 0, fee_pct: 0 },
        { code: 'MOCK_BANK', label: 'Bank (Mock)', fee: 0, fee_pct: 0 },
    ],
};

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232C2F3C'/%3E%3C/svg%3E";

// ── Baris info modal ──────────────────────────────────────────────────────────
function ConfirmRow({ label, value, mono = false, accent = false }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex-shrink-0 pt-0.5">{label}</span>
            <span className={`text-xs font-bold text-right leading-snug ${mono ? 'font-mono' : ''} ${accent ? 'text-store-accent' : 'text-white'}`}>
                {value || <span className="text-white/20 italic">-</span>}
            </span>
        </div>
    );
}

// ── Modal Konfirmasi — slide up dari bawah di mobile ─────────────────────────
function ConfirmModal({ open, onClose, onConfirm, processing, data, product, selectedDuration, voucherInfo, paymentMethods = [] }) {
    if (!open) return null;
    const paymentLabel = paymentMethods.find(m => m.code === data.payment_method)?.label ?? data.payment_method;
    const originalPrice = selectedDuration?.price ?? 0;
    const discountAmount = voucherInfo?.valid ? voucherInfo.discount_amount : 0;
    const finalPrice = voucherInfo?.valid ? voucherInfo.final_price : originalPrice;
    const hasDiscount = discountAmount > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-md bg-store-charcoal border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">

                {/* Handle bar mobile */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="px-5 pt-4 pb-3 sm:px-6 sm:pt-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white font-bebas uppercase tracking-wide">Konfirmasi Pesanan</h3>
                        <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mt-0.5">
                            Pastikan semua detail sudah benar
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                        <AppIcons.close size={14} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="px-5 sm:px-6 py-2 overflow-y-auto flex-1">
                    <div className="py-3 border-b border-white/5">
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Produk</p>
                        <p className="text-base font-bold text-white font-bebas tracking-wide">{product.name}</p>
                    </div>
                    <ConfirmRow label="Layanan" value={selectedDuration?.name} />
                    <ConfirmRow label="Durasi" value={selectedDuration ? (selectedDuration.duration_days > 0 ? `${selectedDuration.duration_days} Hari` : 'Seumur Hidup') : '-'} />
                    <ConfirmRow label="WhatsApp" value={data.whatsapp} mono />
                    <ConfirmRow label="Bayar Via" value={paymentLabel} />
                    {(product.fields || []).length > 0 && (
                        <>
                            <div className="pt-3 pb-1">
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Data Produk</p>
                            </div>
                            {product.fields.map((field) => (
                                <ConfirmRow key={field.id} label={field.label} value={data.fields[field.id] || '-'} mono />
                            ))}
                        </>
                    )}

                    {/* Breakdown harga */}
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Harga</span>
                            <span className={`text-xs font-bold ${hasDiscount ? 'text-white/30 line-through' : 'text-store-accent'}`}>
                                {formatPrice(originalPrice)}
                            </span>
                        </div>
                        {hasDiscount && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-400/70 uppercase tracking-widest flex items-center gap-1">
                                        <AppIcons.tag size={9} /> Voucher <span className="font-mono">{data.voucher_code}</span>
                                    </span>
                                    <span className="text-xs font-bold text-green-400">-{formatPrice(discountAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Bayar</span>
                                    <span className="text-xl font-bold text-store-accent font-bebas">{formatPrice(finalPrice)}</span>
                                </div>
                            </>
                        )}
                        {!hasDiscount && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Bayar</span>
                                <span className="text-xl font-bold text-store-accent font-bebas">{formatPrice(originalPrice)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer — sticky */}
                <div className="px-5 sm:px-6 py-4 border-t border-white/5 space-y-3 flex-shrink-0 bg-store-charcoal">
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center">
                        Key akan dikirim ke nomor WhatsApp Anda
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={onClose}
                            disabled={processing}
                            className="py-3.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40"
                        >
                            Koreksi
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={processing}
                            className="py-3.5 rounded-xl bg-store-accent hover:brightness-110 text-store-dark text-[10px] font-bold uppercase tracking-widest shadow-accent-glow transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Memproses...</>
                            ) : (
                                <><AppIcons.listChecks size={13} strokeWidth={3} /> Konfirmasi & Bayar</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        , document.body
    );
}

// ── Step header ───────────────────────────────────────────────────────────────
function StepHeader({ step, icon, title, subtitle, color = 'accent' }) {
    const palette = {
        accent: 'bg-store-accent/10 border-store-accent/20 text-store-accent',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        blue: 'bg-blue-500/10   border-blue-500/20   text-blue-400',
    };
    const Icon = AppIcons[icon] ?? AppIcons.clipboard;
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${palette[color]}`}>
                <Icon size={15} strokeWidth={2.5} />
            </div>
            <div>
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.25em]">Langkah {step}</span>
                <h3 className="text-base font-bold text-white font-bebas tracking-wide uppercase leading-tight">{title}</h3>
                {subtitle && <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest">{subtitle}</p>}
            </div>
        </div>
    );
}

// ── Related product list item (gaya artikel terkait) ─────────────────────────
function RelatedProductRow({ product }) {
    const prices = product.durations?.map(d => Number(d.price)).filter(p => p > 0) ?? [];
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const hasMultiple = (product.durations?.length ?? 0) > 1;
    const inStock = (product.total_available_count ?? 0) > 0 || product.durations?.some(d => (d.available_keys_count ?? 0) > 0);
    const href = route('products.show.public', product.slug);

    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${inStock
                    ? 'border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                    : 'border-white/[0.03] opacity-50 pointer-events-none'
                }`}
        >
            {/* Thumbnail kecil */}
            <div className="w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                <img
                    src={productImageSrc(product) || PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/80 group-hover:text-white truncate transition-colors leading-snug">
                    {product.name}
                </p>
                {lowestPrice > 0 ? (
                    <p className="text-[10px] font-bold text-store-accent font-bebas leading-none mt-0.5">
                        {hasMultiple && <span className="text-white/20 font-sans text-[7px] normal-case mr-0.5">ab</span>}
                        {formatPrice(lowestPrice)}
                    </p>
                ) : (
                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">—</p>
                )}
            </div>

            {/* Stock + arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {inStock ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
                ) : (
                    <span className="text-[7px] font-bold text-red-400/50 uppercase">Habis</span>
                )}
                <AppIcons.arrowRight
                    size={11}
                    className="text-white/15 group-hover:text-store-accent group-hover:translate-x-0.5 transition-all"
                />
            </div>
        </Link>
    );
}

// ── Info pill: dipakai di compact header mobile ───────────────────────────────
function InfoPill({ icon, label }) {
    const Icon = AppIcons[icon];
    return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-[8px] font-bold text-white/40 uppercase tracking-widest">
            {Icon && <Icon size={9} />} {label}
        </span>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetail({ product, related = [], paymentChannels = [], checkoutGateway = 'mock', midtransSandboxMode = false }) {
    const { flash } = usePage().props;
    const fallbackList = FALLBACK_BY_GATEWAY[checkoutGateway] || FALLBACK_BY_GATEWAY.mock;
    const PAYMENT_METHODS = paymentChannels.length > 0
        ? paymentChannels.map(ch => ({ code: ch.code, label: ch.label, fee: ch.fee ?? 0, fee_pct: ch.fee_pct ?? 0, icon_url: ch.icon_url ?? null }))
        : fallbackList;
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // State voucher: null | { valid, message, discount_amount, final_price, label }
    const [voucherInfo, setVoucherInfo] = useState(null);
    const [voucherLoading, setVoucherLoading] = useState(false);

    const buildInitialFields = () => {
        const obj = {};
        (product.fields || []).forEach((f) => { obj[f.id] = ''; });
        return obj;
    };

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        duration_id: '',
        whatsapp: '',
        payment_method: PAYMENT_METHODS[0]?.code ?? '',
        voucher_code: '',
        fields: buildInitialFields(),
    });

    const handleSelectDuration = (d) => {
        if (d.available_keys_count === 0) return;
        setSelectedDuration(d);
        setData('duration_id', d.id);
        // Reset voucher info saat paket berubah (harga berubah)
        setVoucherInfo(null);
    };

    // Cek voucher ke endpoint /vouchers/check
    const checkVoucher = useCallback(async () => {
        const code = data.voucher_code.trim();
        if (!code || !selectedDuration) return;

        setVoucherLoading(true);
        setVoucherInfo(null);
        try {
            const res = await fetch(route('vouchers.check'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ code, price: selectedDuration.price }),
            });
            const json = await res.json();
            setVoucherInfo(json);
        } catch {
            setVoucherInfo({ valid: false, message: 'Gagal mengecek voucher. Coba lagi.' });
        } finally {
            setVoucherLoading(false);
        }
    }, [data.voucher_code, selectedDuration]);

    const handleSubmitClick = (e) => {
        e.preventDefault();
        if (!selectedDuration || !data.whatsapp.trim()) return;
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        post(route('checkout.store'), { onError: () => setShowConfirm(false) });
    };

    const hasStock = product.durations?.some(d => (d.available_keys_count ?? 0) > 0);
    const hasFields = (product.fields || []).length > 0;
    const step2 = hasFields ? 2 : 1;
    const step3 = hasFields ? 3 : 2;
    const canSubmit = selectedDuration && data.whatsapp.trim().length >= 8;

    const totalStock = product.durations?.reduce((sum, d) => sum + (d.available_keys_count ?? 0), 0) ?? 0;
    const activeDurationsCount = product.durations?.filter(d => (d.available_keys_count ?? 0) > 0).length ?? 0;
    const lowestPrice = Math.min(...(product.durations?.map(d => Number(d.price)).filter(p => p > 0) ?? [0]));

    return (
        <GuestLayout title={product.name}>
            <Head title={`${product.name} — Order`} />

            {flash?.error && (
                <div className="section-container pt-4">
                    <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/25 text-[10px] font-bold text-red-400 uppercase tracking-wide leading-relaxed">
                        {flash.error}
                    </div>
                </div>
            )}

            <ConfirmModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                processing={processing}
                data={data}
                product={product}
                selectedDuration={selectedDuration}
                voucherInfo={voucherInfo}
                paymentMethods={PAYMENT_METHODS}
            />

            <div className="section-container pb-24">
                {midtransSandboxMode && (
                    <div className="mb-4 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            Mode sandbox Midtrans
                        </p>
                        <p className="text-[11px] text-white/45 font-medium leading-relaxed mt-1">
                            Pembayaran uji saja; gunakan kartu dan skenario dari dokumentasi Midtrans sandbox. Bukan uang sungguhan.
                        </p>
                    </div>
                )}

                {/* ═══ MAIN LAYOUT ══════════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 items-start">

                    {/* ── Detail Produk: tampil di semua screen ─────────── */}
                    <div className="w-full lg:w-72 xl:w-80 lg:flex-shrink-0 space-y-3 lg:sticky lg:top-28">

                        {/* Gambar — landscape di mobile, portrait di desktop */}
                        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-store-charcoal-light group">
                            {/* Mobile: header image landscape + nama overlay */}
                            <div className="lg:hidden">
                                <div className="relative h-36 sm:h-44 overflow-hidden">
                                    <img
                                        src={productImageSrc(product) || PLACEHOLDER}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-store-charcoal via-store-charcoal/40 to-transparent" />
                                    {!hasStock && (
                                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-red-500/80 text-white text-[8px] font-bold uppercase tracking-widest">Habis</span>
                                    )}
                                </div>
                                {/* Nama + harga di bawah gambar (dalam card) */}
                                <div className="px-4 pt-3 pb-4">
                                    <h1 className="text-2xl font-bold text-white font-bebas tracking-wide leading-tight mb-1">
                                        {product.name}
                                    </h1>
                                    {lowestPrice > 0 && lowestPrice < Infinity && (
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">
                                                {(product.durations?.length ?? 0) > 1 ? 'Mulai dari' : 'Harga'}
                                            </p>
                                            <p className="text-xl font-bold text-store-accent font-bebas leading-none">
                                                {formatPrice(lowestPrice)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {hasStock ? (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-green-400 uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                {totalStock} Tersedia
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-red-400 uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Habis
                                            </span>
                                        )}
                                        <InfoPill icon="speed" label="Instan" />
                                        <InfoPill icon="phone" label="Via WA" />
                                        <InfoPill icon="shield" label="Aman" />
                                    </div>
                                </div>
                            </div>

                            {/* Desktop: tall portrait image */}
                            <div className="hidden lg:block">
                                <div className="aspect-[3/4] overflow-hidden">
                                    <img
                                        src={productImageSrc(product) || PLACEHOLDER}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-store-charcoal/80 via-transparent to-transparent" />
                                {!hasStock && (
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-red-500/80 text-white text-[8px] font-bold uppercase tracking-widest">Habis</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        {product.description && (
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div
                                    className="text-white/40 text-xs leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        )}

                        {/* Info rows */}
                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden divide-y divide-white/5">
                            {/* Mobile: 2×2 grid untuk 4 baris utama */}
                            <div className="lg:hidden grid grid-cols-2 divide-x divide-white/5">
                                <div className="px-3 py-2.5 flex items-center gap-2">
                                    <AppIcons.boxes size={12} className="text-white/25 flex-shrink-0" />
                                    <div>
                                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Stok</p>
                                        {hasStock ? (
                                            <p className="text-[10px] font-bold text-green-400">{totalStock} Lisensi</p>
                                        ) : (
                                            <p className="text-[10px] font-bold text-red-400">Habis</p>
                                        )}
                                    </div>
                                </div>
                                <div className="px-3 py-2.5 flex items-center gap-2">
                                    <AppIcons.speed size={12} className="text-white/25 flex-shrink-0" />
                                    <div>
                                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Pengiriman</p>
                                        <p className="text-[10px] font-bold text-white">Instan</p>
                                    </div>
                                </div>
                                <div className="px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
                                    <AppIcons.phone size={12} className="text-white/25 flex-shrink-0" />
                                    <div>
                                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Notifikasi</p>
                                        <p className="text-[10px] font-bold text-white">Via WhatsApp</p>
                                    </div>
                                </div>
                                <div className="px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
                                    <AppIcons.shield size={12} className="text-white/25 flex-shrink-0" />
                                    <div>
                                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Keamanan</p>
                                        <p className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" /> Terjamin
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop: list rows */}
                            <div className="hidden lg:block divide-y divide-white/5">
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.boxes size={13} className="text-white/30" />
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Stok</span>
                                    </div>
                                    {hasStock ? (
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-green-400">{totalStock} Lisensi</p>
                                            <p className="text-[7px] font-bold text-white/20 uppercase">{activeDurationsCount} paket aktif</p>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-red-400">Habis</span>
                                    )}
                                </div>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.speed size={13} className="text-white/30" />
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Pengiriman</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white">Otomatis Instan</span>
                                </div>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.phone size={13} className="text-white/30" />
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Notifikasi</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white">Via WhatsApp</span>
                                </div>
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.shield size={13} className="text-white/30" />
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Keamanan</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Terjamin
                                    </span>
                                </div>
                            </div>

                            {/* Ketersediaan paket — semua screen */}
                            {product.durations && product.durations.length > 0 && (
                                <div className="px-4 py-3">
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <AppIcons.layers size={10} /> Ketersediaan Paket
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5">
                                        {product.durations.map(d => (
                                            <div key={d.id} className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-white/50 truncate max-w-[55%]">{d.name}</span>
                                                {d.available_keys_count > 0 ? (
                                                    <span className="text-[8px] font-bold text-green-400 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-green-400" />
                                                        {d.available_keys_count} stok
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] font-bold text-red-400/60">Habis</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── KANAN: Form Order ─────────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-3">

                        {/* Banner stok habis */}
                        {!hasStock && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                                <AppIcons.help size={15} className="text-red-400 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">
                                    Stok habis — tidak tersedia saat ini.
                                </p>
                            </div>
                        )}

                        {/* ── STEP 1: Dynamic fields ─── */}
                        {hasFields && (
                            <div className="p-4 sm:p-6 rounded-2xl bg-store-charcoal-light/30 border border-white/5">
                                <StepHeader step={1} icon="clipboard" title="Data Produk" subtitle="Isi informasi yang dibutuhkan" color="accent" />
                                <div className="space-y-3">
                                    {product.fields.map((field) => (
                                        <GuestInput
                                            key={field.id}
                                            label={field.label}
                                            icon={fieldIcon(field)}
                                            type={field.type === 'textarea' ? 'textarea' : (field.type || 'text')}
                                            rows={3}
                                            placeholder={field.placeholder || field.label}
                                            value={data.fields[field.id] || ''}
                                            onChange={(e) => setData('fields', { ...data.fields, [field.id]: e.target.value })}
                                            error={errors[`fields.${field.id}`]}
                                            required={field.is_required}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Pilih Paket ─────── */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-store-charcoal-light/30 border border-white/5">
                            <StepHeader step={step2} icon="layers" title="Pilih Paket" subtitle="Pilih durasi dan harga" color="purple" />
                            <div className="grid grid-cols-3 gap-1.5">
                                {product.durations?.map((duration) => {
                                    const outOfStock = duration.available_keys_count === 0;
                                    const isSelected = selectedDuration?.id === duration.id;
                                    return (
                                        <button
                                            key={duration.id}
                                            type="button"
                                            onClick={() => handleSelectDuration(duration)}
                                            disabled={outOfStock}
                                            className={`p-2.5 rounded-xl border-2 transition-all duration-200 text-left ${outOfStock
                                                    ? 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-store-accent/10 border-store-accent shadow-accent-glow'
                                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]'
                                                }`}
                                        >
                                            <p className={`text-[7px] font-bold uppercase tracking-widest mb-0.5 truncate ${outOfStock ? 'text-white/20' : isSelected ? 'text-store-accent' : 'text-white/20'
                                                }`}>
                                                {duration.duration_days > 0 ? `${duration.duration_days}H` : 'Lifetime'}
                                            </p>
                                            <p className={`text-xs font-bold font-bebas uppercase leading-none mb-1 truncate ${outOfStock ? 'text-white/30' : 'text-white'
                                                }`}>
                                                {duration.name}
                                            </p>
                                            <div className="flex items-center justify-between gap-1">
                                                <span className={`text-xs font-bold font-bebas leading-none ${outOfStock ? 'text-white/20' : 'text-store-accent'}`}>
                                                    {formatPrice(duration.price)}
                                                </span>
                                                {isSelected && !outOfStock && <AppIcons.check size={10} strokeWidth={3} className="text-store-accent flex-shrink-0" />}
                                                {outOfStock && <span className="text-[6px] font-bold text-red-400/60 uppercase">Habis</span>}
                                            </div>
                                            {!outOfStock && duration.available_keys_count > 0 && duration.available_keys_count <= 5 && (
                                                <p className="text-[6px] font-bold text-yellow-400/60 uppercase mt-0.5">
                                                    Sisa {duration.available_keys_count}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── STEP 3: Detail Order ─────── */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-store-charcoal-light/30 border border-white/5 space-y-4">
                            <StepHeader step={step3} icon="receipt" title="Detail Order" subtitle="Lengkapi informasi pemesanan" color="blue" />

                            {/* WhatsApp */}
                            <GuestInput
                                label="Nomor WhatsApp / HP"
                                icon="phone"
                                type="tel"
                                inputMode="numeric"
                                placeholder="0812XXXXXXXX"
                                value={data.whatsapp}
                                onChange={(e) => setData('whatsapp', e.target.value)}
                                error={errors.whatsapp}
                                required
                            />

                            {/* Voucher */}
                            <div className="space-y-2">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <GuestInput
                                            label="Kode Voucher"
                                            icon="ticket"
                                            type="text"
                                            autoCapitalize="characters"
                                            placeholder="CONTOH10"
                                            value={data.voucher_code}
                                            onChange={(e) => {
                                                setData('voucher_code', e.target.value.toUpperCase());
                                                setVoucherInfo(null); // reset saat input berubah
                                            }}
                                            error={errors.voucher_code}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={checkVoucher}
                                        disabled={!data.voucher_code.trim() || !selectedDuration || voucherLoading}
                                        className="flex-shrink-0 px-4 py-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed
                                            bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20"
                                    >
                                        {voucherLoading ? (
                                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                        ) : 'Cek'}
                                    </button>
                                </div>

                                {/* Feedback voucher */}
                                {voucherInfo && (
                                    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${voucherInfo.valid
                                            ? 'bg-green-400/5 border-green-400/20 text-green-400'
                                            : 'bg-red-400/5 border-red-400/20 text-red-400'
                                        }`}>
                                        {voucherInfo.valid
                                            ? <AppIcons.check size={13} className="flex-shrink-0 mt-0.5" strokeWidth={3} />
                                            : <AppIcons.help size={13} className="flex-shrink-0 mt-0.5" />
                                        }
                                        <span className="leading-snug">{voucherInfo.message}</span>
                                    </div>
                                )}

                                {/* Hint: pilih paket dulu sebelum cek voucher */}
                                {!selectedDuration && data.voucher_code.trim() && (
                                    <p className="text-[9px] font-bold text-yellow-400/50 uppercase tracking-widest flex items-center gap-1 px-1">
                                        <AppIcons.layers size={10} /> Pilih paket dulu untuk mengecek voucher
                                    </p>
                                )}
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 px-1">
                                    <AppIcons.wallet size={11} className="text-white/30" />
                                    <span className="text-[9px] font-black text-white/35 uppercase tracking-[0.25em]">Metode Pembayaran</span>
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {PAYMENT_METHODS.map((method) => {
                                        const isSelected = data.payment_method === method.code;
                                        return (
                                            <button
                                                key={method.code}
                                                type="button"
                                                onClick={() => setData('payment_method', method.code)}
                                                className={`py-2 rounded-xl border transition-all text-[8px] font-bold uppercase tracking-wide active:scale-95 ${isSelected
                                                        ? 'bg-store-accent/10 border-store-accent text-store-accent'
                                                        : 'bg-white/[0.03] border-white/5 text-white/35 hover:border-white/20 hover:text-white/70'
                                                    }`}
                                            >
                                                {method.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Error global */}
                            {errors.error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                    <AppIcons.help size={13} className="text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{errors.error}</p>
                                </div>
                            )}

                            {/* Ringkasan harga + diskon voucher */}
                            {selectedDuration && (() => {
                                const hasVoucherDiscount = voucherInfo?.valid && voucherInfo.discount_amount > 0;
                                const displayPrice = hasVoucherDiscount ? voucherInfo.final_price : selectedDuration.price;
                                return (
                                    <div className={`p-3.5 rounded-xl border transition-colors ${hasVoucherDiscount
                                            ? 'bg-green-400/5 border-green-400/20'
                                            : 'bg-white/[0.03] border-white/5'
                                        }`}>
                                        {hasVoucherDiscount && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[8px] font-bold text-white/25 uppercase tracking-widest line-through">
                                                    {formatPrice(selectedDuration.price)}
                                                </span>
                                                <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                                                    <AppIcons.tag size={9} /> -{formatPrice(voucherInfo.discount_amount)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Total Bayar</p>
                                                <p className="text-2xl font-bold text-store-accent font-bebas leading-none">
                                                    {formatPrice(displayPrice)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-green-400 uppercase flex items-center justify-end gap-1 mb-0.5">
                                                    <AppIcons.speed size={8} /> Instan
                                                </p>
                                                <p className="text-[7px] text-white/20 uppercase">
                                                    {PAYMENT_METHODS.find(m => m.code === data.payment_method)?.label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Hint mengapa disabled */}
                            {!selectedDuration && (
                                <p className="text-[9px] font-bold text-yellow-400/40 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                                    <AppIcons.layers size={10} /> Pilih paket terlebih dahulu
                                </p>
                            )}
                            {selectedDuration && !data.whatsapp.trim() && (
                                <p className="text-[9px] font-bold text-yellow-400/40 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                                    <AppIcons.phone size={10} /> Masukkan nomor WhatsApp
                                </p>
                            )}

                            {/* Submit button */}
                            <button
                                type="button"
                                onClick={handleSubmitClick}
                                disabled={!canSubmit}
                                className="w-full bg-store-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-store-dark font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-accent-glow flex items-center justify-center gap-2.5 text-[11px]"
                            >
                                Cek & Konfirmasi Pesanan
                                <AppIcons.arrowRight size={14} strokeWidth={3} />
                            </button>

                            <p className="text-center text-[7px] text-white/15 uppercase tracking-widest">
                                Detail pesanan akan ditampilkan sebelum dikonfirmasi
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Produk Lainnya (gaya list artikel terkait) ───────────── */}
                {related.length > 0 && (
                    <div className="mt-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] flex items-center gap-2">
                                <AppIcons.layers size={11} className="text-white/20" />
                                Produk Lainnya
                            </p>
                            <Link
                                href={route('catalog')}
                                className="text-[8px] font-bold text-white/20 uppercase tracking-widest hover:text-store-accent transition-colors flex items-center gap-1"
                            >
                                Lihat Semua <AppIcons.arrowRight size={9} />
                            </Link>
                        </div>

                        {/* List */}
                        <div className="rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/[0.04]">
                            {related.map((rp) => (
                                <RelatedProductRow key={rp.id} product={rp} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
