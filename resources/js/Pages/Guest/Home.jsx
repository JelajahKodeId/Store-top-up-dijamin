import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';
import ProductCard from '@/Components/shared/ProductCard';

export default function Home({ products = [], banners = [] }) {
    const activeBanners = banners.filter(b => b.is_active);
    const [activeSlide, setActiveSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % Math.max(activeBanners.length, 1));
    }, [activeBanners.length]);

    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [activeBanners.length, nextSlide]);

    const goToSlide = (idx) => setActiveSlide(idx);

    return (
        <GuestLayout>
            <Head title="Level up your Gaming Gears — Mall Store" />

            {/* ══ Hero Section: Pure Clickable Visual Banner ══════════════════════════════════════ */}
            <section className="relative pb-6 bg-store-charcoal">
                <div className="section-container">
                    {/* Container Utama dengan Shadow & Border Lux */}
                    <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-store-charcoal-darker border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

                        {/* Slides wrapper */}
                        <div className="relative aspect-[4/5] md:aspect-[21/9] lg:aspect-[24/9] overflow-hidden">
                            {activeBanners.length > 0 ? (
                                activeBanners.map((banner, idx) => (
                                    <Link
                                        key={banner.id}
                                        href={banner.url_path || `/catalog`}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer block group ${
                                            idx === activeSlide
                                                ? 'opacity-100 z-10'
                                                : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                    >
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title || "Promotion"}
                                            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03]"
                                        />
                                        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] pointer-events-none" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                    </Link>
                                ))
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <AppIcons.boxes size={40} />
                                </div>
                            )}

                            {/* Dot Navigation — pakai activeBanners agar index konsisten */}
                            {activeBanners.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                                    {activeBanners.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                goToSlide(i);
                                            }}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                i === activeSlide
                                                    ? 'w-8 bg-store-accent'
                                                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Bezel Border Overlay */}
                        <div className="absolute inset-0 rounded-2xl md:rounded-[2.5rem] border border-white/5 pointer-events-none z-30" />
                    </div>
                </div>
            </section>

            {/* ══ Product Grid ════════════════════════════════════════════════════ */}
            <section className="py-16 bg-store-charcoal relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

                <div className="section-container relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-store-accent/10 border border-store-accent/20 text-store-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-store-accent animate-pulse" />
                                Terpopuler Saat Ini
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white font-bebas tracking-wide uppercase leading-tight">Top Pick Product</h2>
                            <p className="text-white/40 text-sm mt-2 leading-relaxed">Lisensi game digital & software premium dengan sistem pengiriman instan.</p>
                        </div>
                        <Link href="/catalog">
                            <Button variant="secondary" size="sm" className="rounded-xl">
                                Semua Produk <AppIcons.arrowRight size={14} />
                            </Button>
                        </Link>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                            <AppIcons.boxes size={48} className="mx-auto mb-4 text-white/10" />
                            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Stocking up catalogs...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══ Trust & Stats ════════════════════════════════════════════════════ */}
            <section className="py-20 bg-store-charcoal-light/20 border-t border-white/5">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
                        <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
                            <h2 className="text-3xl md:text-5xl font-bold text-white font-bebas uppercase" style={{ lineHeight: '1.0', letterSpacing: '0.01em' }}>
                                Authorized<br /><span className="text-store-accent">Gaming Partner</span>
                            </h2>
                            <p className="text-white/40 text-sm max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
                                Kami bekerja sama langsung dengan provider global untuk menjamin keaslian lisensi dan keamanan transaksi Anda.
                            </p>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['NVIDIA', 'STEAM', 'RAZER', 'EPIC'].map(brand => (
                                <div
                                    key={brand}
                                    className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl font-bold font-bebas tracking-[0.2em] text-white/20 hover:text-store-accent hover:bg-white/5 transition-all duration-300 cursor-default"
                                >
                                    {brand}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: 'Verified Gamers', value: '10K+', icon: 'users' },
                            { label: 'Fast Delivery', value: '0.1s', icon: 'zap' },
                            { label: 'Security Level', value: 'Grade A', icon: 'shield' },
                            { label: 'System Uptime', value: '99.9%', icon: 'activity' },
                        ].map((stat, i) => {
                            const StatIcon = AppIcons[stat.icon] ?? AppIcons.zap;
                            return (
                                <div key={i} className="p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center group hover:border-store-accent/20 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-store-accent/10 flex items-center justify-center text-store-accent mb-4 group-hover:scale-110 transition-transform">
                                        <StatIcon size={24} />
                                    </div>
                                    <span className="text-3xl font-bold text-white font-bebas tracking-wide">{stat.value}</span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}