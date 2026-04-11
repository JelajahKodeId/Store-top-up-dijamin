import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';
import { formatPrice, productImageSrc } from '@/utils/guest';

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

    return (
        <div className={`group flex flex-col overflow-hidden rounded-xl bg-guest-surface shadow-md transition-all duration-300 ${
            isOutOfStock ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-lg'
        }`}>
            <div className="relative aspect-[4/5] overflow-hidden">
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

                {isOutOfStock ? (
                    <div className="pointer-events-none absolute right-2 top-2 z-[1] flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-red-600 shadow-sm backdrop-blur-sm">
                        <AppIcons.close size={8} strokeWidth={3} />
                        <span className="text-xs font-semibold uppercase">Habis</span>
                    </div>
                ) : (
                    <div className="pointer-events-none absolute right-2 top-2 z-[1] flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-amber-700 shadow-sm backdrop-blur-sm">
                        <AppIcons.speed size={8} strokeWidth={3} />
                        <span className="text-xs font-semibold uppercase">Instan</span>
                    </div>
                )}

                {tgUrl && (
                    <button
                        type="button"
                        title="Undang grup Telegram"
                        onClick={() => window.open(tgUrl, '_blank', 'noopener,noreferrer')}
                        className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                    >
                        <AppIcons.download size={16} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            <div className="flex flex-grow flex-col p-3">
                <Link
                    href={href ?? '#'}
                    onClick={!href ? (e) => e.preventDefault() : undefined}
                >
                    <h3 className="mb-1 truncate font-bebas text-base font-bold leading-tight tracking-wide text-guest-text transition-colors group-hover:text-store-accent-dark">
                        {product.name}
                    </h3>
                </Link>

                <div className="mb-3">
                    {hasMultipleDurations && (
                        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-guest-subtle">Mulai dari</p>
                    )}
                    <span className="font-bebas text-base font-bold tracking-tight text-guest-text">
                        {lowestPrice > 0 ? formatPrice(lowestPrice) : '—'}
                    </span>
                </div>

                <div className="mt-auto">
                    <Link
                        href={href ?? '#'}
                        onClick={!href ? (e) => e.preventDefault() : undefined}
                    >
                        <button
                            type="button"
                            disabled={isOutOfStock}
                            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wide shadow-sm transition-all ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-guest-elevated text-guest-subtle'
                                    : 'bg-guest-elevated text-guest-text hover:bg-store-accent hover:text-guest-text hover:shadow-md'
                            }`}
                        >
                            {isOutOfStock ? (
                                <><AppIcons.close size={10} strokeWidth={3} /> Stok Habis</>
                            ) : (
                                <><AppIcons.arrowRight size={10} strokeWidth={3} /> Lihat Detail</>
                            )}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
