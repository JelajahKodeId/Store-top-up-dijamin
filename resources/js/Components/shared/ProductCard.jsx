import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';
import { formatPrice } from '@/utils/guest';

// Placeholder abu-abu jika gambar tidak ada
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%232C2F3C'/%3E%3Ctext x='200' y='260' font-family='sans-serif' font-size='40' fill='%234a4d5e' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }) {
    const activeDurations     = product.durations?.filter(d => d.is_active !== false) ?? [];
    // Ambil harga terendah dari semua durasi aktif
    const prices              = activeDurations.map(d => Number(d.price)).filter(p => p > 0);
    const lowestPrice         = prices.length > 0 ? Math.min(...prices) : 0;
    const hasMultipleDurations = activeDurations.length > 1;

    // Stok habis hanya jika SEMUA durasi punya available_keys_count === 0 (bukan menggunakan fallback 1)
    const hasStockData  = activeDurations.some(d => d.available_keys_count !== undefined);
    const isOutOfStock  = hasStockData
        ? activeDurations.every(d => (d.available_keys_count ?? 0) === 0)
        : false; // kalau data stok belum dimuat, default tidak habis

    const href = isOutOfStock ? undefined : `/products/${product.slug ?? product.id}`;

    return (
        <div className={`group flex flex-col bg-store-charcoal-light rounded-xl overflow-hidden border transition-all duration-300 shadow-md ${
            isOutOfStock
                ? 'border-white/5 opacity-60'
                : 'border-white/5 hover:border-store-accent/30 hover:-translate-y-0.5'
        }`}>
            {/* Gambar */}
            <Link
                href={href ?? '#'}
                onClick={!href ? (e) => e.preventDefault() : undefined}
                className="relative aspect-[4/5] overflow-hidden block"
            >
                <img
                    src={product.image || PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-store-charcoal/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {isOutOfStock ? (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/20 backdrop-blur-sm border border-red-500/20 text-red-400">
                        <AppIcons.close size={8} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase">Habis</span>
                    </div>
                ) : (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-store-accent">
                        <AppIcons.speed size={8} strokeWidth={3} />
                        <span className="text-[8px] font-bold uppercase">Instan</span>
                    </div>
                )}
            </Link>

            {/* Konten */}
            <div className="p-3 flex flex-col flex-grow">
                <Link
                    href={href ?? '#'}
                    onClick={!href ? (e) => e.preventDefault() : undefined}
                >
                    <h3 className="text-sm font-bold text-white font-bebas tracking-wide mb-1 group-hover:text-store-accent transition-colors truncate leading-tight">
                        {product.name}
                    </h3>
                </Link>

                <div className="mb-3">
                    {hasMultipleDurations && (
                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Mulai dari</p>
                    )}
                    <span className="text-base font-bold text-white font-bebas tracking-tight">
                        {lowestPrice > 0 ? formatPrice(lowestPrice) : '—'}
                    </span>
                </div>

                <div className="mt-auto">
                    <Link
                        href={href ?? '#'}
                        onClick={!href ? (e) => e.preventDefault() : undefined}
                    >
                        <button
                            disabled={isOutOfStock}
                            className={`w-full text-[9px] font-bold uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all border ${
                                isOutOfStock
                                    ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-store-accent text-white hover:text-store-dark border-white/5 hover:border-store-accent'
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
