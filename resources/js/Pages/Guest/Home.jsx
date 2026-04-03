import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Home({ categories = [] }) {
    return (
        <GuestLayout>
            <Head title="Mall Store — Top-up Game Instan & Terpercaya" />

            {/* ══ Hero Section ════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-store-dark">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-admin-accent/5 to-transparent pointer-events-none" />
                <div className="absolute -top-40 -left-20 w-96 h-96 bg-store-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="section-container relative z-10 py-24 md:py-32">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-gray-300 tracking-wide">
                                Platform Top-up #1 Indonesia
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                            Top-up Game{' '}
                            <span className="text-gradient-yellow">Instan</span>
                            <br className="hidden sm:block" />
                            {' '}& Terpercaya
                        </h1>

                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mb-10">
                            Isi saldo game favoritmu dalam hitungan detik. Aman, cepat, dan tersedia 24 jam sehari.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <a href="#katalog" className="btn-primary text-sm px-6 py-3">
                                Mulai Top-up
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <a href="#cara" className="btn-secondary text-sm px-6 py-3 !bg-white/10 !border-white/10 !text-white hover:!bg-white/15">
                                Cara Top-up
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md">
                            {[
                                { value: '100+', label: 'Game tersedia' },
                                { value: '50K+', label: 'Transaksi sukses' },
                                { value: '99%', label: 'Tingkat sukses' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-xl font-black text-store-accent">{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ Features Strip ══════════════════════════════════════════════ */}
            <section className="bg-white border-b border-store-border">
                <div className="section-container py-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: '⚡', title: 'Instan', sub: 'Proses < 30 detik' },
                            { icon: '🔒', title: 'Aman', sub: 'SSL & enkripsi' },
                            { icon: '🕐', title: '24/7', sub: 'Siap kapan saja' },
                            { icon: '💳', title: 'Banyak Metode', sub: 'QRIS, e-wallet, dll' },
                        ].map((f) => (
                            <div key={f.title} className="flex items-center gap-3 py-2">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <p className="text-sm font-bold text-store-dark">{f.title}</p>
                                    <p className="text-xs text-store-subtle">{f.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ Game Catalog ════════════════════════════════════════════════ */}
            <section id="katalog" className="section-container py-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="t-label mb-2">Katalog</p>
                        <h2 className="text-2xl font-black text-store-dark">Pilih Game Favoritmu</h2>
                        <p className="text-sm text-store-muted mt-1">100+ game tersedia dengan harga terbaik</p>
                    </div>
                    <a href="/catalog" className="text-sm font-bold text-admin-accent hover:opacity-70 transition-opacity hidden sm:block">
                        Lihat semua →
                    </a>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/catalog/${cat.slug ?? cat.id}`}
                                className="store-card store-card-hover group cursor-pointer p-3 flex flex-col items-center text-center"
                            >
                                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-store-surface-2">
                                    <img
                                        src={cat.image_url}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-xs font-bold text-store-dark truncate w-full mb-1">
                                    {cat.name}
                                </h3>
                                <span className="badge-indigo text-[10px]">Instan</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="text-center py-20 bg-white rounded-2xl border border-store-border">
                        <div className="w-16 h-16 bg-store-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-store-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-store-body mb-1">Katalog Belum Tersedia</h3>
                        <p className="text-xs text-store-subtle">Game akan segera hadir. Pantau terus update kami!</p>
                    </div>
                )}
            </section>

            {/* ══ How To Section ══════════════════════════════════════════════ */}
            <section id="cara" className="bg-white border-t border-store-border">
                <div className="section-container py-16">
                    <div className="text-center mb-12">
                        <p className="t-label mb-2">Cara Kerja</p>
                        <h2 className="text-2xl font-black text-store-dark">Top-up dalam 3 Langkah</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { step: '01', title: 'Pilih Game', desc: 'Cari dan pilih game yang ingin kamu isi saldo.' },
                            { step: '02', title: 'Pilih Nominal', desc: 'Tentukan jumlah top-up yang sesuai kebutuhanmu.' },
                            { step: '03', title: 'Bayar & Selesai', desc: 'Bayar via metode favoritmu dan top-up langsung masuk.' },
                        ].map((item) => (
                            <div key={item.step} className="text-center p-6 rounded-2xl bg-store-surface-2 border border-store-border">
                                <div className="text-3xl font-black text-store-border-2 mb-4 font-mono">{item.step}</div>
                                <h3 className="text-sm font-bold text-store-dark mb-2">{item.title}</h3>
                                <p className="text-xs text-store-muted leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
