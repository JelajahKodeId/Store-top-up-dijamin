import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Home({ products = [] }) {
    return (
        <GuestLayout>
            <Head title="Mall Store — Platform Jual Beli Key Game & Lisensi Digital" />

            {/* ══ Hero Section ════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-store-dark">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-admin-accent/5 to-transparent pointer-events-none" />
                <div className="absolute -top-40 -left-20 w-96 h-96 bg-store-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="section-container relative z-10 py-24 md:py-32">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-gray-300 tracking-wide">
                                Toko Lisensi Digital #1 Indonesia
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                            Key Game & Lisensi{' '}
                            <span className="text-gradient-yellow">Digital</span>
                            <br className="hidden sm:block" />
                            {' '}Instan & Terpercaya
                        </h1>

                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mb-10">
                            Dapatkan akses instan ke game favorit dan software premium. Aman, legal, dan tersedia 24 jam sehari.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <a href="#katalog" className="btn-primary text-sm px-6 py-3">
                                Lihat Katalog
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <a href="#cara" className="btn-secondary text-sm px-6 py-3 !bg-white/10 !border-white/10 !text-white hover:!bg-white/15">
                                Cara Aktivasi
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ Game Catalog ════════════════════════════════════════════════ */}
            <section id="katalog" className="section-container py-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="t-label mb-2">Produk Tersedia</p>
                        <h2 className="text-2xl font-black text-store-dark">Pilih Lisensi Digital</h2>
                        <p className="text-sm text-store-muted mt-1">Dapatkan harga terbaik untuk game dan software favoritmu</p>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug ?? product.id}`}
                                className="store-card store-card-hover group cursor-pointer p-4 flex flex-col"
                            >
                                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-store-surface-2">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-sm font-black text-store-dark mb-1 group-hover:text-store-accent transition-colors">
                                    {product.name}
                                </h3>
                                <div className="mt-auto">
                                    <p className="text-xs text-store-muted mb-2">Mulai dari</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black text-store-dark">
                                            Rp {number_format(product.durations[0]?.price || 0, 0, ',', '.')}
                                        </span>
                                        <span className="badge-indigo text-[10px]">Instan</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-store-border shadow-sm">
                        <div className="w-16 h-16 bg-store-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl text-store-subtle">📦</span>
                        </div>
                        <h3 className="text-sm font-bold text-store-body mb-1">Katalog Sedang Diperbarui</h3>
                        <p className="text-xs text-store-subtle text-balance max-w-xs mx-auto">Kami sedang menambahkan produk baru. Silakan kembali beberapa saat lagi!</p>
                    </div>
                )}
            </section>
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
