import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';

export default function Home({ products = [], banners = [] }) {
    const [activeSlide, setActiveSlide] = useState(0);

    // Auto-advance every 5 seconds
    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % Math.max(banners.length, 1));
    }, [banners.length]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [banners.length, nextSlide]);

    const goToSlide = (idx) => setActiveSlide(idx);

    return (
        <GuestLayout>
            <Head title="Level up your Gaming Gears — Mall Store" />

            {/* ══ Hero Section: Banner Slider ══════════════════════════════════════ */}
            <section className="relative pb-10 bg-store-charcoal">
                <div className="section-container">
                    <div className="relative overflow-hidden rounded-xl shadow-lg border border-white/5 bg-store-charcoal-light">

                        {/* Slides wrapper */}
                        <div className="relative aspect-[21/9] md:aspect-[24/9] overflow-hidden">
                            {banners.length > 0 ? (
                                banners.map((banner, idx) => (
                                    <div
                                        key={banner.id}
                                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === activeSlide
                                            ? 'opacity-100 scale-100'
                                            : 'opacity-0 scale-[1.02] pointer-events-none'
                                            }`}
                                    >
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 banner-gradient" />

                                        {/* Slide Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                                            <div className="max-w-2xl space-y-4">
                                                <h2 className="section-heading text-glow-accent">
                                                    {banner.title}
                                                </h2>
                                                {banner.subtitle && (
                                                    <p className="section-subtext max-w-md">{banner.subtitle}</p>
                                                )}
                                                <div className="pt-2">
                                                    <Button
                                                        variant="accent"
                                                        className="rounded-2xl py-4 px-10 uppercase tracking-widest font-black flex items-center gap-3 group/btn shadow-accent-glow"
                                                    >
                                                        Lihat Penawaran
                                                        <AppIcons.arrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* Fallback placeholder */
                                <div className="absolute inset-0 bg-store-charcoal-lighter flex items-center justify-center p-8 text-center">
                                    <div className="space-y-6">
                                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-white/10 animate-pulse">
                                            <AppIcons.boxes size={64} />
                                        </div>
                                        <h2 className="section-heading text-white/20">Premium Collection</h2>
                                    </div>
                                </div>
                            )}

                            {/* Prev / Next arrows */}
                            {banners.length > 1 && (
                                <>
                                    <button
                                        onClick={() => goToSlide((activeSlide - 1 + banners.length) % banners.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg bg-black/40 hover:bg-store-accent/80 border border-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                                    >
                                        <AppIcons.chevronLeft size={20} strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => goToSlide((activeSlide + 1) % banners.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg bg-black/40 hover:bg-store-accent/80 border border-white/10 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                                    >
                                        <AppIcons.arrowRight size={20} strokeWidth={2.5} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dot Navigation */}
                        {banners.length > 1 && (
                            <div className="absolute bottom-8 right-8 flex items-center gap-2 z-20">
                                {banners.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === activeSlide
                                            ? 'w-8 bg-store-accent shadow-accent-glow'
                                            : 'w-2 bg-white/25 hover:bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══ Product Grid ════════════════════════════════════════════════════ */}
            <section className="py-16 bg-store-charcoal relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

                <div className="section-container relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
                        <div className="max-w-2xl">
                            <div className="label-chip bg-store-accent/10 border border-store-accent/20 text-store-accent mb-5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-store-accent opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-store-accent" />
                                </span>
                                Katalog Terpopuler
                            </div>
                            <h2 className="section-heading mb-3">Top Pick Product</h2>
                            <p className="section-subtext">Beli lisensi game digital & software premium dengan proses kilat.</p>
                        </div>
                        <Link
                            href="/catalog"
                            className="flex items-center gap-3 text-xs font-black text-white/40 hover:text-store-accent uppercase tracking-widest transition-colors py-3 px-6 rounded-2xl bg-white/5 border border-white/5 hover:border-store-accent/20 group whitespace-nowrap"
                        >
                            Semua Produk <AppIcons.arrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug ?? product.id}`}
                                    className="card-gaming group p-3 flex flex-col transition-colors duration-200 hover:border-white/10"
                                >
                                    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-4 relative bg-store-charcoal">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <span className="w-full bg-store-accent text-store-dark text-[10px] font-black uppercase tracking-widest py-2.5 rounded-md flex items-center justify-center gap-2">
                                                <AppIcons.plus size={12} strokeWidth={4} /> Detail Produk
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-2 pb-3">
                                        <h3 className="text-base font-black text-white font-bebas tracking-wide mb-1.5 group-hover:text-store-accent transition-colors truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-white font-bebas tracking-tight">
                                                Rp {number_format(product.durations?.[0]?.price || 0, 0, ',', '.')}
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
                                <AppIcons.boxes size={64} />
                            </div>
                            <h3 className="section-heading mb-4 opacity-30">Stocking up...</h3>
                            <p className="section-subtext max-w-sm mx-auto">Kami sedang memproses update katalog terbaru untuk Anda.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ══ Trust & Stats ════════════════════════════════════════════════════ */}
            <section className="py-20 bg-store-charcoal-light/30 border-t border-white/5">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-20">
                        <div className="lg:col-span-1 space-y-5">
                            <h2 className="section-heading text-glow-accent">
                                Authorized<br /><span className="text-store-accent">Gaming Partner</span>
                            </h2>
                            <p className="section-subtext">Keamanan data dan keaslian lisensi adalah prioritas utama kami. Bermitra dengan provider global terkemuka.</p>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {['NVIDIA', 'STEAM', 'RAZER', 'EPIC'].map(brand => (
                                <div
                                    key={brand}
                                    className="h-20 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black font-bebas tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300 cursor-default"
                                >
                                    {brand}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Verified Gamers', value: '10K+', icon: 'users' },
                            { label: 'Fast Delivery', value: '0.1s', icon: 'zap' },
                            { label: 'Security Level', value: 'Grade A', icon: 'shield' },
                            { label: 'System Uptime', value: '99.9%', icon: 'activity' },
                        ].map((stat, i) => {
                            const StatIcon = AppIcons[stat.icon] ?? AppIcons.zap;
                            return (
                                <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-store-accent/5 hover:border-store-accent/10 transition-all duration-500 group">
                                    <div className="w-14 h-14 rounded-2xl bg-store-charcoal-lighter flex items-center justify-center text-store-accent group-hover:scale-110 transition-transform">
                                        <StatIcon size={28} />
                                    </div>
                                    <span className="text-4xl font-black text-white font-bebas tracking-wide leading-none">{stat.value}</span>
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}

function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    const n = !isFinite(+number) ? 0 : +number;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = thousands_sep ?? '.';
    const dec = dec_point ?? ',';
    const toFixedFix = (n, prec) => '' + Math.round(n * Math.pow(10, prec)) / Math.pow(10, prec);
    let s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    if ((s[1] || '').length < prec) { s[1] = s[1] || ''; s[1] += new Array(prec - s[1].length + 1).join('0'); }
    return s.join(dec);
}
