import { Head, useForm, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import GuestInput from '@/Components/guest/GuestInput';
import { formatPrice, formatSoldCount, productImageSrc } from '@/utils/guest';

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

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%23E4E4E7'/%3E%3C/svg%3E";

function StarsDisplay({ rating, size = 16 }) {
    const r = Math.round(Number(rating) || 0);
    const Star = AppIcons.star;
    return (
        <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${r} dari 5 bintang`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    strokeWidth={2}
                    className={i <= r ? 'fill-amber-500 text-amber-600' : 'fill-none text-zinc-400'}
                />
            ))}
        </span>
    );
}

function RatingPicker({ value, onChange, disabled }) {
    const Star = AppIcons.star;
    return (
        <div className="flex flex-wrap items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(n)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100 disabled:opacity-40"
                    aria-label={`${n} bintang`}
                >
                    <Star
                        size={26}
                        strokeWidth={2}
                        className={value >= n ? 'fill-amber-500 text-amber-600' : 'fill-none text-zinc-400'}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {
    const name = (review.author_name || 'Pembeli').trim() || 'Pembeli';
    const initial = name.charAt(0).toUpperCase();
    const ratingNum = Math.round(Number(review.rating) || 0);

    return (
        <li className="rounded-2xl border border-guest-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex gap-3 sm:gap-4">
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-black text-white shadow-inner"
                    aria-hidden
                >
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-base font-bold text-zinc-900">{name}</span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-amber-900">
                            {ratingNum}/5
                        </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <StarsDisplay rating={review.rating} size={16} />
                        <span className="text-sm font-semibold text-zinc-700">{ratingNum} bintang</span>
                        {review.created_at && (
                            <span className="text-xs font-medium text-zinc-500">· {review.created_at}</span>
                        )}
                    </div>
                    <p className="mt-2 text-sm leading-normal text-zinc-800 sm:text-[15px]">{review.body}</p>
                </div>
            </div>
        </li>
    );
}

// ── Baris info modal ──────────────────────────────────────────────────────────
function ConfirmRow({ label, value, mono = false, accent = false }) {
    return (
        <div className="flex flex-col gap-1 border-b border-guest-border py-2.5 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <span className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-guest-subtle">{label}</span>
            <span className={`break-words text-sm font-semibold leading-snug sm:max-w-[65%] sm:text-right ${mono ? 'font-mono' : ''} ${accent ? 'text-store-accent' : 'text-guest-text'}`}>
                {value || <span className="italic text-guest-subtle">-</span>}
            </span>
        </div>
    );
}

// ── Modal Konfirmasi — portal + kunci scroll; selalu di tengah (mobile & desktop) ─
function ConfirmModal({ open, onClose, onConfirm, processing, data, product, selectedDuration, voucherInfo, paymentMethods = [] }) {
    useEffect(() => {
        if (!open) {
            return;
        }
        const html = document.documentElement;
        const body = document.body;
        const prevHtml = html.style.overflow;
        const prevBody = body.style.overflow;
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';

        const onKey = (e) => {
            if (e.key === 'Escape' && !processing) {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            html.style.overflow = prevHtml;
            body.style.overflow = prevBody;
        };
    }, [open, onClose, processing]);

    if (!open) {
        return null;
    }

    const paymentLabel = paymentMethods.find(m => m.code === data.payment_method)?.label ?? data.payment_method;
    const originalPrice = selectedDuration?.price ?? 0;
    const discountAmount = voucherInfo?.valid ? voucherInfo.discount_amount : 0;
    const finalPrice = voucherInfo?.valid ? voucherInfo.final_price : originalPrice;
    const hasDiscount = discountAmount > 0;

    const modal = (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-order-title"
        >
            <button
                type="button"
                className="absolute inset-0 cursor-default border-0 bg-black/40 p-0 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Tutup"
            />
            <div
                className="relative z-10 mx-auto flex h-auto min-h-0 w-full max-w-md max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] flex-col overflow-hidden rounded-3xl border border-guest-border bg-guest-surface shadow-lux sm:max-h-[min(90dvh,44rem)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-guest-border bg-guest-elevated px-5 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
                    <div className="min-w-0 pr-2">
                        <h3 id="confirm-order-title" className="font-bebas text-xl font-bold uppercase tracking-wide text-guest-text">
                            Konfirmasi Pesanan
                        </h3>
                        <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-guest-subtle">
                            Pastikan semua detail sudah benar
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-guest-border bg-guest-surface text-guest-muted transition-colors hover:bg-guest-elevated hover:text-guest-text"
                    >
                        <AppIcons.close size={14} />
                    </button>
                </div>

                {/* Body — satu-satunya area scroll; min-h-0 wajib untuk flex */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-2 [-webkit-overflow-scrolling:touch] sm:px-6">
                    <div className="border-b border-guest-border py-3">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-guest-subtle">Produk</p>
                        <p className="font-bebas text-base font-bold tracking-wide text-guest-text">{product.name}</p>
                    </div>
                    <ConfirmRow label="Layanan" value={selectedDuration?.name} />
                    <ConfirmRow label="Durasi" value={selectedDuration ? (selectedDuration.duration_days > 0 ? `${selectedDuration.duration_days} Hari` : 'Seumur Hidup') : '-'} />
                    <ConfirmRow label="WhatsApp" value={data.whatsapp} mono />
                    <ConfirmRow label="Bayar Via" value={paymentLabel} />
                    {(product.fields || []).length > 0 && (
                        <>
                            <div className="pb-1 pt-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Data Produk</p>
                            </div>
                            {product.fields.map((field) => (
                                <ConfirmRow key={field.id} label={field.label} value={data.fields[field.id] || '-'} mono />
                            ))}
                        </>
                    )}

                    {/* Breakdown harga */}
                    <div className="mt-3 space-y-1.5 border-t border-guest-border pt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold uppercase tracking-wide text-guest-subtle">Harga</span>
                            <span className={`text-xs font-bold ${hasDiscount ? 'text-guest-subtle line-through' : 'text-store-accent'}`}>
                                {formatPrice(originalPrice)}
                            </span>
                        </div>
                        {hasDiscount && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-green-700">
                                        <AppIcons.tag size={9} /> Voucher <span className="font-mono">{data.voucher_code}</span>
                                    </span>
                                    <span className="text-xs font-bold text-green-700">-{formatPrice(discountAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-guest-border pt-1.5">
                                    <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Total Bayar</span>
                                    <span className="font-bebas text-xl font-bold text-store-accent">{formatPrice(finalPrice)}</span>
                                </div>
                            </>
                        )}
                        {!hasDiscount && (
                            <div className="flex items-center justify-between border-t border-guest-border pt-1.5">
                                <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Total Bayar</span>
                                <span className="font-bebas text-xl font-bold text-store-accent">{formatPrice(originalPrice)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer — tidak ikut scroll; safe area iOS */}
                <div className="shrink-0 space-y-3 border-t border-guest-border bg-guest-elevated px-5 py-4 sm:px-6">
                    <p className="text-center text-xs font-bold uppercase tracking-wide text-guest-subtle">
                        Key akan dikirim ke nomor WhatsApp Anda
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-guest-border bg-guest-surface py-3.5 text-sm font-bold uppercase tracking-wide text-guest-muted transition-colors hover:bg-guest-elevated disabled:opacity-40"
                        >
                            Koreksi
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={processing}
                            className="flex items-center justify-center gap-2 rounded-xl bg-store-accent py-3.5 text-sm font-bold uppercase tracking-wide text-store-dark shadow-accent-glow transition-all hover:brightness-110 disabled:opacity-40"
                        >
                            {processing ? (
                                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Memproses...</>
                            ) : (
                                <><AppIcons.listChecks size={13} strokeWidth={3} /> Konfirmasi & Bayar</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

// ── Step header ───────────────────────────────────────────────────────────────
function StepHeader({ step, icon, title, subtitle, color = 'accent' }) {
    const palette = {
        accent: 'border-store-accent/25 bg-store-accent/10 text-store-accent',
        purple: 'border-purple-200 bg-purple-50 text-purple-700',
        blue: 'border-blue-200 bg-blue-50 text-blue-700',
    };
    const Icon = AppIcons[icon] ?? AppIcons.clipboard;
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border ${palette[color]}`}>
                <Icon size={15} strokeWidth={2.5} />
            </div>
            <div>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-guest-subtle">Langkah {step}</span>
                <h3 className="font-bebas text-base font-bold uppercase leading-tight tracking-wide text-guest-text">{title}</h3>
                {subtitle && <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">{subtitle}</p>}
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
    const soldLabel = formatSoldCount(product.sold_count);

    return (
        <Link
            href={href}
            className={`group flex w-full items-center gap-3 px-4 py-3 transition-colors ${inStock
                ? 'hover:bg-guest-elevated'
                : 'pointer-events-none opacity-50'
            }`}
        >
            <div className="h-11 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-guest-border bg-guest-elevated">
                <img
                    src={productImageSrc(product) || PLACEHOLDER}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
            </div>

            <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold leading-snug text-guest-text transition-colors group-hover:text-store-accent sm:text-base">
                    {product.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {lowestPrice > 0 ? (
                        <p className="font-bebas text-sm font-bold leading-none text-store-accent">
                            {hasMultiple && <span className="mr-0.5 font-sans text-[10px] font-semibold normal-case text-guest-subtle">dari </span>}
                            {formatPrice(lowestPrice)}
                        </p>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-wide text-guest-subtle">—</span>
                    )}
                    <span className="text-[11px] font-semibold text-guest-subtle">{soldLabel} terjual</span>
                </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
                {inStock ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" title="Tersedia" />
                ) : (
                    <span className="text-[10px] font-bold uppercase text-red-500">Habis</span>
                )}
                <AppIcons.arrowRight
                    size={11}
                    className="text-guest-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-store-accent"
                />
            </div>
        </Link>
    );
}

// ── Info pill: dipakai di compact header mobile ───────────────────────────────
function InfoPill({ icon, label }) {
    const Icon = AppIcons[icon];
    return (
        <span className="flex items-center gap-1 rounded-lg border border-guest-border bg-guest-elevated px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-guest-muted">
            {Icon && <Icon size={12} strokeWidth={2} />} {label}
        </span>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetail({
    product,
    related = [],
    paymentChannels = [],
    checkoutGateway = 'mock',
    midtransSandboxMode = false,
    reviewInvoice = null,
}) {
    const { flash, site } = usePage().props;
    const reviews = product.reviews ?? [];
    const reviewAvg = useMemo(() => {
        if (!reviews.length) return null;
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    }, [reviews]);

    const csWaHref = useMemo(() => {
        if (!site?.whatsapp) {
            return null;
        }
        const digits = String(site.whatsapp).replace(/\D/g, '');
        if (!digits) {
            return null;
        }
        const text = `Halo, saya ingin bertanya tentang produk "${product.name}".`;
        return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    }, [site?.whatsapp, product.name]);

    const reviewForm = useForm({
        author_name: '',
        rating: 5,
        body: '',
        invoice_code: reviewInvoice ?? '',
    });

    const reviewFormAnchorRef = useRef(null);
    const [showReviewForm, setShowReviewForm] = useState(() => Boolean(reviewInvoice));

    useEffect(() => {
        if (reviewInvoice) {
            reviewForm.setData('invoice_code', reviewInvoice);
            setShowReviewForm(true);
        }
        // Sinkronkan query ?invoice=… ke form (bukan dependency reviewForm)
    }, [reviewInvoice]);

    const openReviewForm = useCallback(() => {
        setShowReviewForm(true);
    }, []);

    useEffect(() => {
        if (!showReviewForm) {
            return undefined;
        }
        const t = window.setTimeout(() => {
            reviewFormAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => window.clearTimeout(t);
    }, [showReviewForm]);

    const submitReview = (e) => {
        e.preventDefault();
        reviewForm.post(route('products.reviews.store', product.slug), {
            preserveScroll: true,
            onSuccess: () => {
                reviewForm.reset();
                if (reviewInvoice) {
                    reviewForm.setData('invoice_code', reviewInvoice);
                }
            },
        });
    };
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
    const soldDisplay = formatSoldCount(product.sold_count);

    const relatedBlock = related.length > 0 ? (
        <section aria-labelledby="related-products-title" className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-guest-border bg-guest-elevated px-4 py-3 sm:px-5">
                <h2 id="related-products-title" className="flex items-center gap-2 font-bebas text-lg font-bold uppercase tracking-wide text-guest-text">
                    <AppIcons.layers size={14} className="text-guest-subtle" />
                    Produk lainnya
                </h2>
                <Link
                    href={route('catalog')}
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-guest-muted transition-colors hover:text-store-accent sm:text-xs"
                >
                    Lihat semua <AppIcons.arrowRight size={9} />
                </Link>
            </div>
            <div className="divide-y divide-guest-border">
                {related.map((rp) => (
                    <RelatedProductRow key={rp.id} product={rp} />
                ))}
            </div>
        </section>
    ) : null;

    const reviewsBlock = (
        <section id="ulasan-pembeli" className="scroll-mt-28 overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-soft">
            <div className="border-b border-guest-border bg-guest-elevated px-4 py-2.5 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="flex items-center gap-2 font-bebas text-base font-bold uppercase tracking-wide text-guest-text sm:text-lg">
                        <AppIcons.star size={14} strokeWidth={2} className="text-amber-500" />
                        Ulasan pembeli
                    </h2>
                    {reviews.length > 0 ? (
                        <span className="text-xs font-bold uppercase tracking-wide text-guest-muted">
                            {reviews.length} ulasan
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-guest-muted">Belum ada</span>
                    )}
                </div>
            </div>
            <div className="p-4 sm:p-5">
                <p className="mb-4 text-sm leading-normal text-zinc-600 sm:text-[15px]">
                    Nama penulis, nilai bintang, dan teks ulasan ditampilkan di bawah. Menulis ulasan hanya untuk pesanan{' '}
                    <strong className="font-bold text-zinc-900">berhasil (selesai)</strong>
                    — dari halaman status pesanan atau form di bawah.
                </p>

                {reviews.length > 0 ? (
                    <ul className="mb-6 space-y-3 sm:space-y-4">
                        {reviews.map((r) => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </ul>
                ) : (
                    <p className="mb-6 text-sm font-medium text-zinc-700">Belum ada ulasan untuk produk ini.</p>
                )}

                {!showReviewForm && (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/90 p-4 text-center sm:p-5">
                        <p className="text-sm font-semibold text-zinc-800">Sudah membayar untuk produk ini?</p>
                        <p className="mt-1 text-xs leading-normal text-zinc-600 sm:text-sm">Gunakan tombol di halaman status pesanan atau buka form di bawah halaman.</p>
                        <button
                            type="button"
                            onClick={openReviewForm}
                            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-all hover:bg-zinc-800 sm:mt-4 sm:px-5 sm:py-3 sm:text-sm"
                        >
                            <AppIcons.star size={15} strokeWidth={2} className="text-amber-300" />
                            Tulis ulasan (pembeli)
                        </button>
                    </div>
                )}
                {showReviewForm && (
                    <p className="text-center text-xs font-medium text-zinc-600 sm:text-sm">
                        Form ulasan ada di bagian bawah halaman.
                        {!reviewInvoice && (
                            <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className="ml-2 font-bold text-store-accent-dark underline-offset-2 hover:underline"
                            >
                                Tutup
                            </button>
                        )}
                    </p>
                )}
            </div>
        </section>
    );

    const reviewFormSection = showReviewForm ? (
        <div ref={reviewFormAnchorRef} id="form-ulasan-pembeli" className="scroll-mt-28">
            <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-soft">
                <div className="border-b border-guest-border bg-guest-elevated px-4 py-3 sm:px-5">
                    <p className="text-xs font-black uppercase tracking-wide text-zinc-900">Form ulasan pembeli</p>
                </div>
                <form onSubmit={submitReview} className="space-y-4 p-4 sm:space-y-5 sm:p-5">
                    <GuestInput
                        label="Nomor invoice"
                        icon="receipt"
                        type="text"
                        value={reviewForm.data.invoice_code}
                        onChange={(e) => reviewForm.setData('invoice_code', e.target.value.toUpperCase())}
                        error={reviewForm.errors.invoice_code}
                        placeholder="Contoh: INV-XXXXXXXXXXXX"
                        required
                    />
                    <GuestInput
                        label="Nama tampilan"
                        icon="profile"
                        type="text"
                        value={reviewForm.data.author_name}
                        onChange={(e) => reviewForm.setData('author_name', e.target.value)}
                        error={reviewForm.errors.author_name}
                        placeholder="Nama yang tampil di ulasan"
                        required
                    />
                    <div className="space-y-2">
                        <span className="ml-1 text-xs font-black uppercase tracking-wide text-zinc-800">Rating</span>
                        <RatingPicker
                            value={reviewForm.data.rating}
                            onChange={(n) => reviewForm.setData('rating', n)}
                            disabled={reviewForm.processing}
                        />
                        {reviewForm.errors.rating && (
                            <p className="ml-1 text-sm font-medium text-red-600">{reviewForm.errors.rating}</p>
                        )}
                    </div>
                    <GuestInput
                        label="Ulasan"
                        icon="pencil"
                        type="textarea"
                        rows={4}
                        value={reviewForm.data.body}
                        onChange={(e) => reviewForm.setData('body', e.target.value)}
                        error={reviewForm.errors.body}
                        placeholder="Ceritakan pengalaman Anda (minimal 10 karakter)."
                        required
                    />
                    <button
                        type="submit"
                        disabled={reviewForm.processing}
                        className="w-full rounded-xl bg-store-accent py-3.5 text-sm font-bold uppercase tracking-wide text-store-dark shadow-accent-glow transition-all hover:brightness-110 disabled:opacity-40 sm:py-4"
                    >
                        {reviewForm.processing ? 'Mengirim…' : 'Kirim ulasan'}
                    </button>
                </form>
            </div>
        </div>
    ) : null;

    return (
        <GuestLayout title={product.name}>
            <Head title={`${product.name} — Order`} />

            {flash?.error && (
                <div className="section-container pt-4">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-normal text-red-800">
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

            <div className="section-container overflow-x-hidden pb-12 sm:pb-16">
                {midtransSandboxMode && (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-900 sm:text-sm">
                            Mode sandbox Midtrans
                        </p>
                        <p className="mt-1 text-sm font-medium leading-normal text-guest-muted sm:text-[15px]">
                            Pembayaran uji saja; gunakan kartu dan skenario dari dokumentasi Midtrans sandbox. Bukan uang sungguhan.
                        </p>
                    </div>
                )}

                {/* ═══ MAIN LAYOUT ══════════════════════════════════════════ */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">

                    {/* ── Detail Produk: kiri desktop; atas mobile ──────── */}
                    <div className="w-full space-y-3 lg:w-72 lg:flex-shrink-0 xl:w-80">

                        {/* Gambar — landscape di mobile, portrait di desktop */}
                        <div className="group relative overflow-hidden rounded-2xl bg-guest-surface shadow-lg">
                            {/* Mobile: header image landscape + nama overlay */}
                            <div className="lg:hidden">
                                <div className="relative h-36 overflow-hidden sm:h-44">
                                    <img
                                        src={productImageSrc(product) || PLACEHOLDER}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                                    {!hasStock && (
                                        <span className="absolute left-3 top-3 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Habis</span>
                                    )}
                                </div>
                                {/* Nama + harga di bawah gambar (dalam card) */}
                                <div className="px-4 pb-4 pt-3">
                                    <h1 className="mb-1 font-bebas text-2xl font-bold leading-tight tracking-wide text-guest-text">
                                        {product.name}
                                    </h1>
                                    {lowestPrice > 0 && lowestPrice < Infinity && (
                                        <div className="mb-3 flex items-baseline gap-2">
                                            <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">
                                                {(product.durations?.length ?? 0) > 1 ? 'Mulai dari' : 'Harga'}
                                            </p>
                                            <p className="font-bebas text-xl font-bold leading-none text-store-accent">
                                                {formatPrice(lowestPrice)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {hasStock ? (
                                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-green-700">
                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                                {totalStock} Tersedia
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-red-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Habis
                                            </span>
                                        )}
                                        <InfoPill icon="orders" label={`${soldDisplay} terjual`} />
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
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                                {!hasStock && (
                                    <div className="absolute left-3 top-3">
                                        <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Habis</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        {product.description && (
                            <div className="rounded-2xl border border-guest-border bg-guest-surface p-4 shadow-soft">
                                <div
                                    className="text-sm leading-normal text-guest-muted sm:text-[15px] [&_a]:text-store-accent [&_strong]:text-guest-text"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        )}

                        {/* Ringkasan rating & WA — card kecil di bawah deskripsi */}
                        <div
                            className={`grid gap-2 ${csWaHref ? 'grid-cols-2' : 'grid-cols-1'}`}
                            aria-label="Ringkasan ulasan dan kontak"
                        >
                            <a
                                href="#ulasan-pembeli"
                                className="group flex min-h-[5rem] flex-col justify-center rounded-xl border border-guest-border bg-guest-elevated px-2.5 py-2 shadow-sm transition-colors hover:border-amber-400/60 hover:bg-guest-surface sm:min-h-0 sm:px-3 sm:py-2.5"
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <StarsDisplay rating={reviewAvg != null ? Math.round(reviewAvg) : 0} size={12} />
                                    {reviewAvg != null ? (
                                        <>
                                            <span className="font-bebas text-base font-bold leading-none text-guest-text sm:text-lg">
                                                {reviewAvg}
                                            </span>
                                            <span className="text-[10px] font-bold text-guest-muted">/5</span>
                                        </>
                                    ) : (
                                        <span className="text-[11px] font-bold text-guest-muted">Belum dinilai</span>
                                    )}
                                </div>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-guest-subtle">
                                    {reviews.length > 0 ? `${reviews.length} ulasan pembeli` : 'Belum ada ulasan'}
                                </p>
                                <p className="mt-0.5 flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wide text-store-accent sm:text-[10px]">
                                    Lihat ulasan
                                    <AppIcons.arrowRight size={8} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5" />
                                </p>
                            </a>
                            {csWaHref && (
                                <a
                                    href={csWaHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-[5rem] flex-col justify-center rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-2 shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50 sm:min-h-0 sm:px-3 sm:py-2.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white shadow-sm sm:h-8 sm:w-8">
                                            <AppIcons.phone size={12} strokeWidth={2.5} className="sm:hidden" />
                                            <AppIcons.phone size={14} strokeWidth={2.5} className="hidden sm:block" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-wide text-emerald-900 sm:text-[10px]">
                                                WhatsApp
                                            </p>
                                            <p className="truncate text-[11px] font-bold leading-tight text-guest-text sm:text-xs">
                                                Tanya CS
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-[9px] font-semibold leading-snug text-emerald-900/85 sm:text-[10px]">
                                        Chat produk ini
                                    </p>
                                </a>
                            )}
                        </div>

                        {/* Info rows */}
                        <div className="divide-y divide-guest-border overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-soft">
                            {/* Mobile: 2×2 grid untuk 4 baris utama */}
                            <div className="grid grid-cols-2 divide-x divide-guest-border lg:hidden">
                                <div className="flex items-center gap-2 px-3 py-2.5">
                                    <AppIcons.boxes size={12} className="flex-shrink-0 text-guest-subtle" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Stok</p>
                                        {hasStock ? (
                                            <p className="text-sm font-bold text-green-700">{totalStock} Lisensi</p>
                                        ) : (
                                            <p className="text-sm font-bold text-red-600">Habis</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2.5">
                                    <AppIcons.speed size={12} className="flex-shrink-0 text-guest-subtle" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Pengiriman</p>
                                        <p className="text-sm font-bold text-guest-text">Instan</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-t border-guest-border px-3 py-2.5">
                                    <AppIcons.phone size={12} className="flex-shrink-0 text-guest-subtle" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Notifikasi</p>
                                        <p className="text-sm font-bold text-guest-text">Via WhatsApp</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border-t border-guest-border px-3 py-2.5">
                                    <AppIcons.shield size={12} className="flex-shrink-0 text-guest-subtle" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Keamanan</p>
                                        <p className="flex items-center gap-1 text-sm font-bold text-green-700">
                                            <span className="h-1 w-1 animate-pulse rounded-full bg-green-500" /> Terjamin
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 border-t border-guest-border px-3 py-2.5 lg:hidden">
                                    <AppIcons.orders size={12} className="flex-shrink-0 text-guest-subtle" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">Terjual</p>
                                        <p className="text-sm font-bold text-guest-text">{soldDisplay} unit selesai</p>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop: list rows */}
                            <div className="hidden divide-y divide-guest-border lg:block">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.boxes size={13} className="text-guest-muted" />
                                        <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Stok</span>
                                    </div>
                                    {hasStock ? (
                                        <div className="text-right">
                                            <p className="text-base font-bold text-green-700">{totalStock} Lisensi</p>
                                            <p className="text-xs font-bold uppercase text-guest-subtle">{activeDurationsCount} paket aktif</p>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-red-600">Habis</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.orders size={13} className="text-guest-muted" />
                                        <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Terjual</span>
                                    </div>
                                    <span className="text-sm font-bold text-guest-text">{soldDisplay} unit selesai</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.speed size={13} className="text-guest-muted" />
                                        <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Pengiriman</span>
                                    </div>
                                    <span className="text-sm font-bold text-guest-text">Otomatis Instan</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.phone size={13} className="text-guest-muted" />
                                        <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Notifikasi</span>
                                    </div>
                                    <span className="text-sm font-bold text-guest-text">Via WhatsApp</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <AppIcons.shield size={13} className="text-guest-muted" />
                                        <span className="text-sm font-bold uppercase tracking-wide text-guest-muted">Keamanan</span>
                                    </div>
                                    <span className="flex items-center gap-1 text-sm font-bold text-green-700">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> Terjamin
                                    </span>
                                </div>
                            </div>

                            {/* Ketersediaan paket — semua screen */}
                            {product.durations && product.durations.length > 0 && (
                                <div className="px-4 py-3">
                                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-guest-subtle">
                                        <AppIcons.layers size={10} /> Ketersediaan Paket
                                    </p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 lg:grid-cols-1">
                                        {product.durations.map(d => (
                                            <div key={d.id} className="flex items-center justify-between">
                                                <span className="max-w-[55%] truncate text-sm font-bold text-guest-muted">{d.name}</span>
                                                {d.available_keys_count > 0 ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                                                        <span className="h-1 w-1 rounded-full bg-green-500" />
                                                        {d.available_keys_count} stok
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-600">Habis</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── KANAN: Form Order (sticky di desktop) ─────────── */}
                    <div className="min-w-0 flex-1 space-y-3 lg:sticky lg:top-28 lg:self-start">

                        {/* Banner stok habis */}
                        {!hasStock && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <AppIcons.help size={15} className="flex-shrink-0 text-red-600" />
                                <p className="text-sm font-bold uppercase tracking-wide text-red-800">
                                    Stok habis — tidak tersedia saat ini.
                                </p>
                            </div>
                        )}

                        {/* ── STEP 1: Dynamic fields ─── */}
                        {hasFields && (
                            <div className="rounded-2xl border border-guest-border bg-guest-surface p-4 shadow-soft sm:p-6">
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
                        <div className="rounded-2xl border border-guest-border bg-guest-surface p-4 shadow-soft sm:p-6">
                            <StepHeader step={step2} icon="layers" title="Pilih Paket" subtitle="Pilih durasi dan harga" color="purple" />
                            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
                                {product.durations?.map((duration) => {
                                    const outOfStock = duration.available_keys_count === 0;
                                    const isSelected = selectedDuration?.id === duration.id;
                                    return (
                                        <button
                                            key={duration.id}
                                            type="button"
                                            onClick={() => handleSelectDuration(duration)}
                                            disabled={outOfStock}
                                            className={`rounded-xl border-2 p-2.5 text-left transition-all duration-200 ${outOfStock
                                                    ? 'cursor-not-allowed border-guest-border bg-guest-elevated opacity-50'
                                                    : isSelected
                                                        ? 'border-store-accent bg-store-accent/10 shadow-accent-glow'
                                                        : 'border-guest-border bg-guest-elevated hover:border-guest-subtle hover:bg-guest-surface active:scale-[0.98]'
                                                }`}
                                        >
                                            <p className={`mb-0.5 truncate text-xs font-bold uppercase tracking-wide ${outOfStock ? 'text-guest-subtle' : isSelected ? 'text-store-accent' : 'text-guest-subtle'
                                                }`}>
                                                {duration.duration_days > 0 ? `${duration.duration_days}H` : 'Lifetime'}
                                            </p>
                                            <p className={`mb-1 truncate font-bebas text-xs font-bold uppercase leading-none ${outOfStock ? 'text-guest-subtle' : 'text-guest-text'
                                                }`}>
                                                {duration.name}
                                            </p>
                                            <div className="flex items-center justify-between gap-1">
                                                <span className={`font-bebas text-xs font-bold leading-none ${outOfStock ? 'text-guest-subtle' : 'text-store-accent'}`}>
                                                    {formatPrice(duration.price)}
                                                </span>
                                                {isSelected && !outOfStock && <AppIcons.check size={10} strokeWidth={3} className="flex-shrink-0 text-store-accent" />}
                                                {outOfStock && <span className="text-[6px] font-bold uppercase text-red-500">Habis</span>}
                                            </div>
                                            {!outOfStock && duration.available_keys_count > 0 && duration.available_keys_count <= 5 && (
                                                <p className="mt-0.5 text-[6px] font-bold uppercase text-amber-700">
                                                    Sisa {duration.available_keys_count}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── STEP 3: Detail Order ─────── */}
                        <div className="space-y-4 rounded-2xl border border-guest-border bg-guest-surface p-4 shadow-soft sm:p-6">
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
                                        className="flex-shrink-0 rounded-xl border border-guest-border bg-guest-elevated px-4 py-3 text-sm font-bold uppercase tracking-wide text-guest-muted transition-all hover:border-store-accent/40 hover:bg-guest-surface hover:text-guest-text disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        {voucherLoading ? (
                                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                        ) : 'Cek'}
                                    </button>
                                </div>

                                {/* Feedback voucher */}
                                {voucherInfo && (
                                    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold uppercase tracking-wide ${voucherInfo.valid
                                            ? 'border-green-200 bg-green-50 text-green-800'
                                            : 'border-red-200 bg-red-50 text-red-800'
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
                                    <p className="flex items-center gap-1 px-1 text-sm font-bold uppercase tracking-wide text-amber-700">
                                        <AppIcons.layers size={10} /> Pilih paket dulu untuk mengecek voucher
                                    </p>
                                )}
                            </div>

                            {/* Metode Pembayaran */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 px-1">
                                    <AppIcons.wallet size={11} className="text-guest-muted" />
                                    <span className="text-sm font-black uppercase tracking-[0.25em] text-guest-muted">Metode Pembayaran</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {PAYMENT_METHODS.map((method) => {
                                        const isSelected = data.payment_method === method.code;
                                        return (
                                            <button
                                                key={method.code}
                                                type="button"
                                                onClick={() => setData('payment_method', method.code)}
                                                className={`flex min-h-[3.25rem] items-center justify-center rounded-xl border px-1 py-2 text-center text-xs font-semibold uppercase leading-snug tracking-wide transition-all active:scale-[0.98] sm:text-sm ${isSelected
                                                        ? 'border-store-accent bg-store-accent/10 text-store-accent'
                                                        : 'border-guest-border bg-guest-elevated text-guest-muted hover:border-guest-subtle hover:text-guest-text'
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
                                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                                    <AppIcons.help size={13} className="flex-shrink-0 text-red-600" />
                                    <p className="text-sm font-bold uppercase tracking-wide text-red-800">{errors.error}</p>
                                </div>
                            )}

                            {/* Ringkasan harga + diskon voucher */}
                            {selectedDuration && (() => {
                                const hasVoucherDiscount = voucherInfo?.valid && voucherInfo.discount_amount > 0;
                                const displayPrice = hasVoucherDiscount ? voucherInfo.final_price : selectedDuration.price;
                                return (
                                    <div className={`rounded-xl border p-3.5 transition-colors ${hasVoucherDiscount
                                            ? 'border-green-200 bg-green-50/80'
                                            : 'border-guest-border bg-guest-elevated'
                                        }`}>
                                        {hasVoucherDiscount && (
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wide text-guest-subtle line-through">
                                                    {formatPrice(selectedDuration.price)}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-green-800">
                                                    <AppIcons.tag size={9} /> -{formatPrice(voucherInfo.discount_amount)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-guest-subtle">Total Bayar</p>
                                                <p className="font-bebas text-2xl font-bold leading-none text-store-accent">
                                                    {formatPrice(displayPrice)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="mb-0.5 flex items-center justify-end gap-1 text-xs font-bold uppercase text-green-700">
                                                    <AppIcons.speed size={8} /> Instan
                                                </p>
                                                <p className="text-xs uppercase text-guest-subtle">
                                                    {PAYMENT_METHODS.find(m => m.code === data.payment_method)?.label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Hint mengapa disabled */}
                            {!selectedDuration && (
                                <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold uppercase tracking-wide text-amber-700">
                                    <AppIcons.layers size={10} /> Pilih paket terlebih dahulu
                                </p>
                            )}
                            {selectedDuration && !data.whatsapp.trim() && (
                                <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold uppercase tracking-wide text-amber-700">
                                    <AppIcons.phone size={10} /> Masukkan nomor WhatsApp
                                </p>
                            )}

                            {/* Submit button */}
                            <button
                                type="button"
                                onClick={handleSubmitClick}
                                disabled={!canSubmit}
                                className="w-full bg-store-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-store-dark font-black uppercase tracking-wide py-4 rounded-xl transition-all shadow-accent-glow flex items-center justify-center gap-2.5 text-base"
                            >
                                Cek & Konfirmasi Pesanan
                                <AppIcons.arrowRight size={14} strokeWidth={3} />
                            </button>

                            <p className="text-center text-xs uppercase tracking-wide text-guest-subtle">
                                Detail pesanan akan ditampilkan sebelum dikonfirmasi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Satu blok: Telegram → produk lain → ulasan → form (tanpa duplikasi) */}
                <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
                    {product.telegram_group_invite_url?.trim?.() && (
                        <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-soft">
                            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0088cc] text-white shadow-sm">
                                        <AppIcons.download size={18} strokeWidth={2.5} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bebas text-lg font-bold uppercase tracking-wide text-guest-text">Grup Telegram</p>
                                        <p className="mt-0.5 text-sm leading-normal text-guest-muted">
                                            Gabung komunitas untuk info & bantuan produk ini.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={product.telegram_group_invite_url.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-all hover:brightness-110 sm:w-auto sm:px-5 sm:py-3"
                                >
                                    Buka undangan
                                    <AppIcons.arrowRight size={12} strokeWidth={3} />
                                </a>
                            </div>
                        </div>
                    )}

                    {relatedBlock}
                    {reviewsBlock}
                    {reviewFormSection}
                </div>
            </div>
        </GuestLayout>
    );
}
