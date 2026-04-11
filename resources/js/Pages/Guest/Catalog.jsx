import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestInput from '@/Components/guest/GuestInput';
import ProductCard from '@/Components/shared/ProductCard';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState, useMemo } from 'react';

export default function Catalog({ products = [] }) {
    const [search, setSearch] = useState('');

    const filteredProducts = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return products;
        return products.filter(p => p.name.toLowerCase().includes(q));
    }, [products, search]);

    const inStockCount = filteredProducts.filter(p =>
        p.durations?.some(d => (d.available_keys_count ?? 0) > 0)
    ).length;

    return (
        <GuestLayout title="Katalog Produk" subtitle="Eksplorasi produk digital premium dengan pengiriman instan">
            <Head title="Katalog Produk Digital — Mall Store" />

            <div className="section-container pb-12 sm:pb-16">
                <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <GuestInput
                        icon="search"
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full sm:max-w-sm"
                    />

                    <div className="flex items-center gap-3 text-sm font-medium text-guest-muted">
                        <AppIcons.boxes size={14} className="text-store-accent-dark" />
                        {search ? (
                            <span>
                                <span className="text-guest-text">{filteredProducts.length}</span> produk ditemukan
                            </span>
                        ) : (
                            <span>
                                <span className="text-guest-text">{inStockCount}</span> tersedia dari{' '}
                                <span className="text-guest-text">{products.length}</span> produk
                            </span>
                        )}
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-guest-surface py-14 text-center shadow-lg sm:py-16">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-guest-elevated text-guest-subtle shadow-inner sm:mb-5 sm:h-16 sm:w-16">
                            <AppIcons.search size={36} strokeWidth={1.5} />
                        </div>
                        <h3 className="mb-1.5 font-bebas text-xl font-bold tracking-wide text-guest-muted sm:text-2xl">Produk Tidak Ditemukan</h3>
                        <p className="mx-auto max-w-sm text-sm leading-normal text-guest-muted sm:text-[15px]">
                            {search ? `Tidak ada produk dengan kata kunci "${search}". Coba kata kunci lain.` : 'Belum ada produk tersedia saat ini.'}
                        </p>
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="mt-6 rounded-xl border border-store-accent/30 bg-store-accent/10 px-6 py-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-store-accent/20"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
