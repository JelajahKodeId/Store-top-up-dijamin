import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';
import { formatPrice, formatSoldCount, productImageSrc } from '@/utils/guest';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23E4E4E7'/%3E%3Ctext x='200' y='260' font-family='sans-serif' font-size='40' fill='%23A1A1AA' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }) {
    const activeDurations     = product.durations?.filter(d => d.is_active !== false) ?? [];
    const prices              = activeDurations.map(d => Number(d.price)).filter(p => p > 0);
    const lowestPrice         = prices.length > 0 ? Math.min(...prices) : 0;
    const hasMultipleDurations = activeDurations.length > 1;

    const hasStockData  = activeDurations.some(d => d.available_keys_count !== undefined);
    const isOutOfStock  = hasStockData
        ? activeDurations.every(d => (d.available_keys_count ?? 0) === 0)
        : false;

    const href = isOutOfStock ? undefined : `/products/${product.slug ?? product.id}`;

    const tgUrl = product.telegram_group_invite_url?.trim?.() || product.telegram_group_invite_url;
    const soldLabel = formatSoldCount(product.sold_count);

    return (
        <div className={`group flex h-full flex-col overflow-hidden rounded-md bg-guest-surface shadow-sm transition-all duration-300 ${
            isOutOfStock ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow'
        }`}>
            <div className="relative aspect-[5/6] shrink-0 overflow-hidden bg-guest-elevated">
                <Link
                    href={href ?? '#'}
                    onClick={!href ? (e) => e.preventDefault() : undefined}
                    className="absolute inset-0 z-0 block"
                >
                    <img
                        src={productImageSrc(product) || PLACEHOLDER}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>

                <div className="pointer-events-none absolute right-1.5 top-1.5 z-[1] flex flex-col items-end gap-1">
                    {isOutOfStock ? (
                        <div className="inline-flex h-5 items-center gap-0.5 rounded-md bg-red-50 px-1.5 text-[8px] font-bold uppercase leading-none text-red-600 ring-1 ring-red-100">
                            <AppIcons.close size={7} strokeWidth={3} className="shrink-0" />
                            Habis
                        </div>
                    ) : (
                        <div className="inline-flex h-5 items-center gap-0.5 rounded-md bg-white/95 px-1.5 text-[8px] font-bold uppercase leading-none text-amber-800 shadow-sm ring-1 ring-black/5">
                            <AppIcons.speed size={7} strokeWidth={3} className="shrink-0" />
                            Instan
                        </div>
                    )}
                    {product.platform_type && (
                        <div className="inline-flex h-5 items-center gap-1 rounded-md bg-black/80 px-1.5 text-[8px] font-bold uppercase leading-none text-white shadow-sm backdrop-blur-[2px]">
                            {product.platform_type === 'android' && <AppIcons.android size={8} />}
                            {product.platform_type === 'ios' && <AppIcons.ios size={8} />}
                            {product.platform_type === 'both' && (
                                <div className="flex items-center -space-x-1">
                                    <AppIcons.android size={7} />
                                    <AppIcons.ios size={7} />
                                </div>
                            )}
                            <span>{product.platform_type === 'both' ? 'Mobile' : product.platform_type}</span>
                        </div>
                    )}
                </div>

                {tgUrl && (
                    <button
                        type="button"
                        title="Undang grup Telegram"
                        onClick={() => window.open(tgUrl, '_blank', 'noopener,noreferrer')}
                        className="absolute bottom-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-md ring-2 ring-white/90 transition-transform hover:scale-105 active:scale-95"
                    >
                        <AppIcons.download size={11} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-2 sm:px-2.5 sm:pb-2.5 sm:pt-2.5">
                <Link
                    href={href ?? '#'}
                    onClick={!href ? (e) => e.preventDefault() : undefined}
                    className="block shrink-0"
                >
                    <h3 className="line-clamp-2 min-h-[2.25rem] text-left font-bebas text-[11px] font-bold leading-tight tracking-wide text-guest-text transition-colors group-hover:text-store-accent-dark sm:min-h-[2.5rem] sm:text-xs">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-1.5 flex min-h-0 flex-1 flex-col">
                    <div className="shrink-0 space-y-0.5">
                        {hasMultipleDurations && (
                            <p className="text-[8px] font-semibold uppercase tracking-wider text-guest-subtle">Mulai dari</p>
                        )}
                        <p className="font-bebas text-sm font-bold leading-none tracking-tight text-guest-text sm:text-[15px]">
                            {lowestPrice > 0 ? formatPrice(lowestPrice) : '—'}
                        </p>
                        <p className="inline-flex items-center gap-0.5 text-[8px] font-medium text-guest-subtle">
                            <AppIcons.orders size={8} strokeWidth={2} className="shrink-0 opacity-80" aria-hidden />
                            <span>{soldLabel} terjual</span>
                        </p>
                    </div>

                    <div className="mt-auto border-t border-guest-border/70 pt-2">
                        {isOutOfStock ? (
                            <div
                                className="flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-md bg-guest-elevated py-1.5 text-[9px] font-bold uppercase tracking-wide text-guest-subtle shadow-sm sm:py-2 sm:text-[10px]"
                                aria-label="Produk habis"
                            >
                                <AppIcons.close size={9} strokeWidth={3} className="shrink-0" />
                                Habis
                            </div>
                        ) : (
                            <Link href={href} className="block">
                                <span className="flex w-full items-center justify-center gap-1 rounded-md bg-guest-elevated py-1.5 text-[9px] font-bold uppercase tracking-wide text-guest-text shadow-sm transition-all hover:bg-store-accent hover:shadow active:scale-[0.98] sm:py-2 sm:text-[10px]">
                                    Detail
                                    <AppIcons.arrowRight size={9} strokeWidth={3} className="shrink-0" />
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
