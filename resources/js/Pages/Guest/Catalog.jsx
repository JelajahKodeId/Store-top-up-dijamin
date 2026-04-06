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

            <div className="section-container pb-24">
                {/* Search Bar */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <GuestInput
                        icon="search"
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full sm:max-w-sm"
                    />

                    <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <AppIcons.boxes size={14} className="text-store-accent" />
                        {search ? (
                            <span>
                                <span className="text-white/60">{filteredProducts.length}</span> produk ditemukan
                            </span>
                        ) : (
                            <span>
                                <span className="text-white/60">{inStockCount}</span> tersedia dari{' '}
                                <span className="text-white/60">{products.length}</span> produk
                            </span>
                        )}
                    </div>
                </div>

                {/* Grid Produk */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 rounded-[4rem] bg-white/[0.02] border border-dashed border-white/5 backdrop-blur-xl">
                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white/10 animate-pulse">
                            <AppIcons.search size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-white/40 font-bebas tracking-wide mb-2">Produk Tidak Ditemukan</h3>
                        <p className="text-sm text-white/20 max-w-sm mx-auto">
                            {search ? `Tidak ada produk dengan kata kunci "${search}". Coba kata kunci lain.` : 'Belum ada produk tersedia saat ini.'}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="mt-6 px-6 py-2.5 rounded-xl bg-store-accent/10 border border-store-accent/20 text-store-accent text-[10px] font-bold uppercase tracking-widest hover:bg-store-accent/20 transition-colors"
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
