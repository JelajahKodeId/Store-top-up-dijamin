import { Link, usePage } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';
import { formatPrice, formatSoldCount, productImageSrc } from '@/utils/guest';
import { useRef, useEffect } from 'react';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23E4E4E7'/%3E%3Ctext x='200' y='260' font-family='sans-serif' font-size='40' fill='%23A1A1AA' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }) {
    const textRef = useRef(null);
    
    useEffect(() => {
        const resize = () => {
            if (textRef.current) {
                const el = textRef.current;
                el.style.fontSize = window.innerWidth >= 640 ? '14px' : '12px';
                let currentSize = window.innerWidth >= 640 ? 14 : 12;
                while (el.scrollWidth > el.clientWidth && currentSize > 7) {
                    currentSize -= 0.5;
                    el.style.fontSize = currentSize + 'px';
                }
            }
        };

        const parent = textRef.current?.parentElement;
        if (!parent) return;

        const observer = new ResizeObserver(() => resize());
        observer.observe(parent);
        
        return () => observer.disconnect();
    }, [product.name]);

    const { auth } = usePage().props;
    const isResellerEligible = Number(auth?.user?.member_level ?? 0) >= 2;

    const activeDurations = product.durations?.filter((d) => d.is_active !== false) ?? [];
    const prices = activeDurations.map((d) => {
        const base = Number(d.price);
        const reseller = (d.reseller_price !== null && d.reseller_price !== undefined && d.reseller_price !== '') ? Number(d.reseller_price) : null;
        return (isResellerEligible && reseller !== null && reseller > 0) ? reseller : base;
    }).filter((p) => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const isShowingResellerPrice = isResellerEligible && activeDurations.some(d => d.reseller_price !== null && d.reseller_price !== undefined && Number(d.reseller_price) > 0);
    const hasMultipleDurations = activeDurations.length > 1;

    const hasStockData = activeDurations.some((d) => d.available_keys_count !== undefined);
    const isOutOfStock = hasStockData ? activeDurations.every((d) => (d.available_keys_count ?? 0) === 0) : false;

    const href = `/products/${product.slug ?? product.id}`;
    const soldLabel = formatSoldCount(Number(product.sold_count || 0) + Number(product.fake_sold_count || 0));
    const categoryLabel = product.game_category_label;
    
    // Check if telegram link exists
    const hasTelegram = !!product.telegram_group_invite_url?.trim?.();

    const isMaintenance = product.platform_type === 'maintenance';

    const cardClass = `group flex h-full flex-col overflow-hidden rounded-md bg-guest-surface shadow-sm transition-all duration-300 ${
        isOutOfStock ? 'cursor-default opacity-60' : 
        isMaintenance ? 'cursor-default border border-red-500 bg-red-500/5' : 
        'hover:-translate-y-0.5 hover:shadow'
    }`;

    const TopAreaContent = (
        <>
            <div className="relative aspect-[5/6] shrink-0 overflow-hidden bg-guest-elevated">
                <img
                    src={productImageSrc(product) || PLACEHOLDER}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                        isMaintenance ? 'grayscale opacity-50' : 'group-hover:scale-105'
                    }`}
                    onError={(e) => {
                        e.target.src = PLACEHOLDER;
                    }}
                />
                {!isMaintenance && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                )}

                {isMaintenance && (
                    <div className="absolute inset-0 bg-red-950/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-red-600 text-white font-semibold text-[11px] sm:text-[12px] px-2 py-0.5 rounded shadow-md animate-pulse">
                            Maintenance
                        </span>
                    </div>
                )}

                <div className="pointer-events-none absolute right-0 top-0 z-[1] flex flex-col items-end gap-1.5">
                    {isOutOfStock && (
                        <div className="inline-flex h-5 items-center gap-0.5 rounded-l-md bg-red-600 px-2 text-[8px] font-black uppercase leading-none text-white shadow-sm">
                            Habis
                        </div>
                    )}
                    {product.platform_type && (
                        <div className={`inline-flex h-5 items-center px-2 text-[8px] font-black uppercase leading-none text-white shadow-sm rounded-bl-md ${
                            product.platform_type === 'android' ? 'bg-emerald-500' : 
                            product.platform_type === 'ios' ? 'bg-sky-500' : 
                            product.platform_type === 'maintenance' ? 'bg-red-600 font-extrabold' : 
                            'bg-indigo-500'
                        }`}>
                            {product.platform_type === 'both' ? 'Mobile' : product.platform_type === 'maintenance' ? 'Maintenance' : product.platform_type}
                        </div>
                    )}
                </div>

                {/* SVG Ombak Laut — Acak & Natural */}
                <svg 
                    className="pointer-events-none absolute -bottom-[1px] left-0 w-full text-guest-surface" 
                    style={{ height: '14%' }}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 600 60" 
                    preserveAspectRatio="none"
                >
                    <path 
                        fill="currentColor" 
                        d={(() => {
                            // Seed deterministik berdasarkan product.id
                            const seed = (product.id || 1) * 7919;
                            const rand = (i) => {
                                const x = Math.sin(seed + i * 127.1) * 43758.5453;
                                return x - Math.floor(x); // 0..1
                            };

                            // Buat segmen ombak, lebar tiap segmen bervariasi
                            const totalWidth = 600;
                            let path = `M0,60 L0,`;
                            // Titik awal gelombang, sedikit random
                            path += `${30 + rand(0) * 15} `;

                            let x = 0;
                            let segIndex = 0;
                            while (x < totalWidth) {
                                const r = rand(segIndex);
                                const segW = 30 + rand(segIndex + 99) * 50; // lebar segmen 30–80

                                // Gunakan tipe gelombang yang selalu mulus (tidak tajam)
                                const nextX = Math.min(x + segW, totalWidth);
                                const midX = x + (nextX - x) * 0.5;
                                const endY = 35 + rand(segIndex + 200) * 15; // y puncak 35..50 (lebih rata)

                                // Kurva cubic bezier → ombak lembut
                                const cp1y = 50 + rand(segIndex + 300) * 10;
                                const cp2y = 25 + rand(segIndex + 400) * 15;
                                path += `C${x + segW * 0.3},${cp1y} ${x + segW * 0.6},${cp2y} ${nextX},${endY} `;

                                x = nextX;
                                segIndex++;
                            }

                            path += `L${totalWidth},60 Z`;
                            return path;
                        })()} 
                    />
                </svg>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 sm:px-4 sm:pt-4">
                <h3 
                    ref={textRef}
                    className={`whitespace-nowrap overflow-hidden px-1 text-center font-semibold leading-tight transition-colors ${
                        isMaintenance ? 'text-red-500' : 'text-guest-text group-hover:text-store-accent-dark'
                    }`}
                >
                    {product.name}
                </h3>

                <div className="mt-1 flex min-h-0 flex-1 flex-col">
                    <div className="shrink-0 space-y-0.5">
                        {hasMultipleDurations && (
                            <p className="text-[10px] font-medium text-guest-subtle">Mulai dari</p>
                        )}
                        <p className="text-sm font-semibold leading-none text-guest-text sm:text-base mt-0.5">
                            {lowestPrice > 0 ? formatPrice(lowestPrice) : '—'}
                        </p>
                        {isShowingResellerPrice && (
                            <div className="inline-flex items-center gap-1 rounded bg-sky-100 px-1 py-0.5 text-[9px] font-black uppercase tracking-wide text-sky-700">
                                <AppIcons.shield size={9} /> Harga Reseller
                            </div>
                        )}
                        <p className="inline-flex items-center gap-1 text-[10px] font-medium text-guest-subtle pt-1">
                            <AppIcons.orders size={10} strokeWidth={2} className="shrink-0 opacity-80" aria-hidden />
                            <span>{soldLabel} terjual</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className={cardClass}>
            {/* Top Area: Image & Info (Points to Detail Page) */}
            {isMaintenance ? (
                <div className="flex flex-1 flex-col">
                    {TopAreaContent}
                </div>
            ) : (
                <Link href={href} className="flex flex-1 flex-col">
                    {TopAreaContent}
                </Link>
            )}

            {/* Bottom Action Area (Points to Telegram or Detail) */}
            <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                <div className="border-t border-guest-border/70 pt-2">
                    {isMaintenance ? (
                        <div
                            className="flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-[3px] sm:rounded-md bg-red-500/10 py-1.5 text-[10px] font-semibold text-red-500 border border-red-500/20 shadow-sm sm:py-2 sm:text-[11px]"
                            aria-label="Produk sedang maintenance"
                        >
                            <AppIcons.warning size={10} className="shrink-0 animate-bounce text-red-500" />
                            Maintenance
                        </div>
                    ) : isOutOfStock ? (
                        <div
                            className="flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-[3px] sm:rounded-md bg-guest-elevated py-1.5 text-[10px] font-semibold text-guest-subtle shadow-sm sm:py-2 sm:text-[11px]"
                            aria-label="Produk habis"
                        >
                            <AppIcons.close size={9} strokeWidth={3} className="shrink-0" />
                            Habis
                        </div>
                    ) : hasTelegram ? (
                        <a
                            href={product.telegram_group_invite_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-1.5 rounded-[3px] sm:rounded-md bg-sky-600 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow sm:py-2 sm:text-[11px]"
                        >
                            <AppIcons.download size={10} strokeWidth={2.5} className="shrink-0" />
                            Download
                        </a>
                    ) : (
                        <Link
                            href={href}
                            className="flex w-full items-center justify-center gap-1.5 rounded-[3px] sm:rounded-md bg-guest-elevated py-1.5 text-[10px] font-semibold text-guest-text shadow-sm transition-all hover:bg-store-accent hover:text-store-dark hover:shadow sm:py-2 sm:text-[11px]"
                        >
                            <AppIcons.arrowRight size={10} strokeWidth={2.5} className="shrink-0" />
                            Detail
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
