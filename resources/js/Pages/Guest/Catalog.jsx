import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import GuestInput from '@/Components/guest/GuestInput';
import { useState, useMemo } from 'react';

export default function Catalog({ products = [] }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (filter === 'all' || p.category?.name?.toLowerCase() === filter.toLowerCase())
        );
    }, [products, search, filter]);

    return (
        <GuestLayout title="Katalog Lisensi" subtitle="Eksplorasi ribuan produk digital premium">
            <Head title="Katalog Produk Digital — Mall Store" />

            <div className="section-container pb-24">
                {/* Search & Filter Bar */}
                <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <GuestInput
                        icon="search"
                        type="text"
                        placeholder="Cari game atau software..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        containerClassName="w-full md:max-w-md"
                    />

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                        {['all', 'Game', 'Software', 'Premium'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-store-accent text-store-dark shadow-accent-glow'
                                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {f === 'all' ? 'Semua' : f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug ?? product.id}`}
                                className="card-gaming group p-3 flex flex-col hover:border-white/10 transition-colors duration-200"
                            >
                                <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-4 relative bg-store-charcoal">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="w-full bg-store-accent text-store-dark text-[10px] font-black uppercase tracking-widest py-2.5 rounded-md flex items-center justify-center gap-2">
                                            <AppIcons.plus size={12} strokeWidth={4} /> Lihat Detail
                                        </span>
                                    </div>
                                </div>
                                <div className="px-2 pb-3">
                                    <h3 className="text-base font-black text-white font-bebas tracking-wide mb-1.5 group-hover:text-store-accent transition-colors truncate">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-white font-bebas tracking-tight">
                                            Rp {number_format(product.durations[0]?.price || 0, 0, ',', '.')}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-store-accent/10 border border-store-accent/20 text-store-accent">
                                            <AppIcons.zap size={10} strokeWidth={3} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">Instan</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 rounded-[4rem] bg-white/[0.02] border border-dashed border-white/5 backdrop-blur-xl">
                        <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-white/10 animate-pulse">
                            <AppIcons.search size={64} strokeWidth={1} />
                        </div>
                        <h3 className="section-heading mb-4 opacity-40">Produk Tidak Ditemukan</h3>
                        <p className="section-subtext max-w-sm mx-auto">Coba gunakan kata kunci lain atau filter kategori yang berbeda.</p>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}

// Helper function
function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? '.' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
