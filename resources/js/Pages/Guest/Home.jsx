import { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';
import ProductCard from '@/Components/shared/ProductCard';
import GuestInput from '@/Components/guest/GuestInput';

export default function Home({ products = [], banners = [], gameCategories = [], filters = {} }) {
    const activeBanners = banners.filter(b => b.is_active);
    const [activeSlide, setActiveSlide] = useState(0);
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

    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % Math.max(activeBanners.length, 1));
    }, [activeBanners.length]);

    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [activeBanners.length, nextSlide]);

    const goToSlide = (idx) => setActiveSlide(idx);

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

    const { site } = usePage().props;

    return (
        <GuestLayout>
            <Head title="Level up your Gaming Gears — Mall Store" />

            <section className="relative bg-guest-bg pb-6">
                <div className="section-container">
                    <div className="relative overflow-hidden rounded-2xl bg-guest-surface shadow-lg md:rounded-[2.5rem]">
                        <div className="relative aspect-[2/1] overflow-hidden md:aspect-[21/9] lg:aspect-[24/9]">
                            {activeBanners.length > 0 ? (
                                activeBanners.map((banner, idx) => {
                                    const isExternal = banner.link?.startsWith('http');
                                    const bannerProps = {
                                        key: banner.id,
                                        className: `absolute inset-0 block cursor-pointer transition-opacity duration-700 ease-in-out group ${idx === activeSlide
                                                ? 'z-10 opacity-100'
                                                : 'pointer-events-none z-0 opacity-0'
                                            }`
                                    };

                                    const content = (
                                        <>
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title || 'Promotion'}
                                                className="h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03]"
                                            />
                                            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.12)]" />
                                            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                                        </>
                                    );

                                    if (isExternal) {
                                        return (
                                            <a {...bannerProps} href={banner.link} target="_blank" rel="noopener noreferrer">
                                                {content}
                                            </a>
                                        );
                                    }

                                    return (
                                        <Link {...bannerProps} href={banner.link || '/catalog'}>
                                            {content}
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-guest-subtle opacity-40">
                                    <AppIcons.boxes size={40} />
                                </div>
                            )}

                            {activeBanners.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                                    {activeBanners.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                goToSlide(i);
                                            }}
                                            className={`h-1 rounded-full transition-all duration-300 ${i === activeSlide
                                                    ? 'w-8 bg-store-accent'
                                                    : 'w-1.5 bg-white/80 hover:bg-white'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {site?.running_text && (
                        <div className="relative mt-4 overflow-hidden rounded-2xl bg-store-charcoal py-2.5 text-white shadow-sm md:rounded-3xl">
                            <div className="animate-marquee">
                                <div className="flex items-center gap-12 px-6">
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                </div>
                                {/* Duplicate for seamless loop */}
                                <div className="flex items-center gap-12 px-6">
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                    <span className="flex items-center gap-3 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em]">
                                        <AppIcons.zap size={14} className="text-store-accent" />
                                        {site.running_text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="relative overflow-hidden bg-guest-bg py-10 sm:py-12">
                <div className="section-container relative z-10">
                    <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row md:gap-6">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-store-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-store-accent" />
                                Terpopuler Saat Ini
                            </div>
                            <h2 className="font-bebas text-2xl font-bold uppercase leading-tight tracking-wide text-guest-text sm:text-3xl md:text-4xl">Top Pick Product</h2>
                            <p className="mt-1.5 text-sm leading-normal text-guest-muted sm:text-[15px]">Lisensi game digital & software premium dengan sistem pengiriman instan.</p>
                            <div className="mt-5 h-[1.5px] w-20 bg-store-accent" />
                        </div>
                        <Link href={route('catalog')}>
                            <Button variant="dark" size="sm" className="rounded-xl shadow-md">
                                Semua Produk <AppIcons.arrowRight size={14} />
                            </Button>
                        </Link>
                    </div>

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
                                        className={`flex-shrink-0 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${selectedCategory === cat.value
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

                    {selectedCategory ? (
                        filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-guest-surface py-16 text-center shadow-md sm:py-20">
                                <AppIcons.boxes size={48} className="mx-auto mb-4 text-guest-subtle" />
                                <p className="text-xs font-bold uppercase tracking-widest text-guest-muted">Stocking up catalogs...</p>
                            </div>
                        )
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-guest-border py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-guest-elevated text-guest-subtle">
                                <AppIcons.search size={32} />
                            </div>
                            <p className="text-[15px] font-semibold text-guest-text">Eksplorasi Produk Kami</p>
                            <p className="mt-1 text-sm text-guest-muted">Silakan pilih kategori game di atas untuk melihat produk tersedia.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white py-12 sm:py-14">
                <div className="section-container">
                    <div className="mb-10 max-w-3xl">
                        <h2 className="font-bebas text-2xl font-bold uppercase leading-tight text-guest-text sm:text-4xl md:text-5xl" style={{ letterSpacing: '0.01em' }}>
                            Belanja digital <span className="text-store-accent-dark">aman & cepat</span>
                        </h2>
                        <p className="mt-3 text-sm font-normal leading-normal text-guest-muted sm:text-[15px]">
                            Pembayaran terintegrasi, pengiriman key otomatis ke WhatsApp, dan tim siap membantu jika ada kendala — tanpa janji merek pihak ketiga yang tidak kami kelola.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
                        {[
                            { label: 'Verified Gamers', value: '10K+', icon: 'users' },
                            { label: 'Fast Delivery', value: '0.1s', icon: 'zap' },
                            { label: 'Security Level', value: 'Grade A', icon: 'shield' },
                            { label: 'System Uptime', value: '99.9%', icon: 'activity' },
                        ].map((stat, i) => {
                            const StatIcon = AppIcons[stat.icon] ?? AppIcons.zap;
                            return (
                                <div key={i} className="flex flex-col items-center rounded-2xl bg-guest-surface p-4 text-center shadow-md transition-all group-hover:shadow-lg sm:p-5 md:p-6">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-store-accent/10 text-store-accent-dark transition-transform group-hover:scale-110 sm:h-11 sm:w-11">
                                        <StatIcon size={22} />
                                    </div>
                                    <span className="font-bebas text-2xl font-bold tracking-wide text-guest-text sm:text-3xl">{stat.value}</span>
                                    <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-guest-subtle sm:text-xs">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
