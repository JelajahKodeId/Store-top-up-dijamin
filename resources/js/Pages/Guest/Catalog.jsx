import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestInput from '@/Components/guest/GuestInput';
import ProductCard from '@/Components/shared/ProductCard';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState, useMemo, useEffect } from 'react';

export default function Catalog({ products = [], gameCategories = [], filters = {} }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('guest_category_filter');
        return gameCategories.some(c => c.value === saved) ? saved : null;
    });

    useEffect(() => {
        if (selectedCategory) {
            localStorage.setItem('guest_category_filter', selectedCategory);
        }
    }, [selectedCategory]);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedCategory) {
            result = result.filter(p => p.game_category === selectedCategory);
        }

        const q = search.toLowerCase().trim();
        if (q) {
            result = result.filter(p => p.name.toLowerCase().includes(q));
        }

        return result;
    }, [products, search, selectedCategory]);

    const inStockCount = filteredProducts.filter(p =>
        p.durations?.some(d => (d.available_keys_count ?? 0) > 0)
    ).length;

    return (
        <>
            <Head title="Katalog Produk Digital — Mall Store" />

            <div className="section-container pb-12 sm:pb-16">

                <div className="mb-8 flex flex-col items-start gap-6 sm:gap-7">
                    <GuestInput
                        icon="search"
                        type="text"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full sm:max-w-md"
                    />

                    <div className="flex w-full flex-col gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-guest-subtle">Filter Game</span>
                        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                            {gameCategories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`flex-shrink-0 rounded-md px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        selectedCategory === cat.value
                                            ? 'bg-store-accent/15 text-store-accent-dark border border-store-accent shadow-sm'
                                            : 'bg-white border border-guest-border text-guest-muted hover:border-guest-subtle shadow-sm'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-3 text-sm font-medium text-guest-muted">
                    <AppIcons.boxes size={14} className="text-store-accent-dark" />
                    {search || selectedCategory ? (
                        <span>
                            <span className="text-guest-text">{filteredProducts.length}</span> produk ditemukan
                        </span>
                    ) : (
                        <span>Pilih kategori untuk melihat statistik produk</span>
                    )}
                </div>

                {selectedCategory ? (
                    filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
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
                                {search ? `Tidak ada produk dengan kata kunci "${search}". Coba kata kunci lain.` : 'Belum ada produk tersedia dalam kategori ini.'}
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
                    )
                ) : (
                    <div className="rounded-[2.5rem] bg-guest-surface/50 border border-guest-border py-20 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm text-store-accent-dark">
                            <AppIcons.globe size={32} />
                        </div>
                        <h3 className="mb-2 font-bebas text-2xl font-bold tracking-wide text-guest-text">Mulai Eksplorasi</h3>
                        <p className="mx-auto max-w-md text-sm text-guest-muted">
                            Pilih salah satu kategori game di atas untuk melihat katalog produk premium kami.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
