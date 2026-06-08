import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

    const carouselRef = useRef(null);

    const nextSlide = useCallback(() => {
        if (!carouselRef.current || activeBanners.length <= 1) return;
        const width = carouselRef.current.offsetWidth;
        const currentScroll = carouselRef.current.scrollLeft;
        const currentIndex = Math.round(currentScroll / (width + 16)); // 16px is gap-4
        let nextIndex = currentIndex + 1;
        if (nextIndex >= activeBanners.length) nextIndex = 0;
        
        carouselRef.current.scrollTo({ left: nextIndex * (width + 16), behavior: 'smooth' });
    }, [activeBanners.length]);

    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [activeBanners.length, nextSlide]);

    const goToSlide = (idx) => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.offsetWidth;
        carouselRef.current.scrollTo({ left: idx * (width + 16), behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (!carouselRef.current) return;
        const scrollLeft = carouselRef.current.scrollLeft;
        const width = carouselRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / (width + 16));
        if (newIndex !== activeSlide) {
            setActiveSlide(newIndex);
        }
    };

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

    const { site, vouchers = [] } = usePage().props;

    const activeCategoryLabel = useMemo(() => {
        return gameCategories.find(c => c.value === selectedCategory)?.label;
    }, [selectedCategory, gameCategories]);

    const activeVouchers = useMemo(() => {
        if (!selectedCategory) return [];
        let applicable = [];
        vouchers.forEach(v => {
            const matchingProducts = v.products.filter(p => p.game_category === selectedCategory);
            matchingProducts.forEach(p => {
                applicable.push({
                    productName: p.name,
                    code: v.code
                });
            });
        });
        return applicable;
    }, [selectedCategory, vouchers]);

    return (
        <>
            <Head title="Level up your Gaming Gears — Mall Store" />

            <section className="relative bg-guest-bg pb-0">
                <div className="section-container">
                    <div className="relative rounded-sm bg-guest-surface shadow-lg">
                        <div className="relative aspect-[2.5/1] overflow-hidden md:aspect-[21/9] lg:aspect-[24/9]">
                            {activeBanners.length > 0 ? (
                                <div 
                                    ref={carouselRef}
                                    onScroll={handleScroll}
                                    className="flex h-full w-full snap-x snap-mandatory overflow-x-auto gap-4 no-scrollbar scroll-smooth"
                                >
                                    {activeBanners.map((banner, idx) => {
                                        const isExternal = banner.link?.startsWith('http');
                                        const bannerProps = {
                                            key: banner.id,
                                            className: "relative h-full w-full flex-shrink-0 snap-center cursor-pointer group block rounded-sm overflow-hidden"
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
                                    })}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-guest-subtle opacity-40">
                                    <AppIcons.boxes size={40} />
                                </div>
                            )}

                        </div>
                    </div>

                    {site?.running_text && (
                        <div className="relative mt-4 overflow-hidden rounded-md border border-guest-border bg-white py-2.5 text-guest-text shadow-sm">
                            <div className="animate-marquee">
                                <div className="flex items-center gap-12 px-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <span key={i} className="font-poppins flex items-center gap-3 whitespace-nowrap text-[13px] font-bold uppercase tracking-wider">
                                            <AppIcons.zap size={14} className="text-store-accent-dark" />
                                            {site.running_text}
                                        </span>
                                    ))}
                                </div>
                                {/* Duplicate for seamless loop */}
                                <div className="flex items-center gap-12 px-6">
                                    {[5, 6, 7, 8].map((i) => (
                                        <span key={i} className="font-poppins flex items-center gap-3 whitespace-nowrap text-[13px] font-bold uppercase tracking-wider">
                                            <AppIcons.zap size={14} className="text-store-accent-dark" />
                                            {site.running_text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="relative overflow-hidden bg-guest-bg pb-10 pt-6 sm:pb-12 sm:pt-8">
                <div className="section-container relative z-10">
                    <div className="mb-6 flex flex-col gap-6">
                        {/* Saluran Media Sosial */}
                        <div className="grid grid-cols-2 gap-3">
                            {site?.wa_channel && (
                                <a 
                                    href={site.wa_channel} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-poppins flex w-full items-center justify-center gap-1.5 rounded-sm bg-[#25D366] px-2 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:scale-105 hover:bg-[#20bd5a] active:scale-95 sm:gap-2.5 sm:py-3 sm:text-[15px]"
                                >
                                    <img src="/img/logo/whatsapp.webp" alt="WhatsApp" className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6" />
                                    <span className="truncate">CHANEL</span>
                                </a>
                            )}
                            {site?.tg_channel && (
                                <a 
                                    href={site.tg_channel} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-poppins flex w-full items-center justify-center gap-1.5 rounded-sm bg-[#0088cc] px-2 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:scale-105 hover:bg-[#0077b5] active:scale-95 sm:gap-2.5 sm:py-3 sm:text-[15px]"
                                >
                                    <img src="/img/logo/telegram.webp" alt="Telegram" className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6" />
                                    <span className="truncate">CHANEL</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col items-start gap-6 sm:gap-7">
                        <div className="flex w-full flex-col gap-3 sm:gap-4">
                            <div className="w-full">
                                <h2 className="font-poppins text-xl font-bold uppercase leading-tight tracking-wide text-guest-text sm:text-2xl md:text-3xl">
                                    🔥TOP POPULAR
                                </h2>
                            </div>

                            <GuestInput
                                icon="search"
                                solidIcon={true}
                                type="text"
                                placeholder="Mau Top Up Apa?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                containerClassName="w-full sm:max-w-md"
                            />
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                                {gameCategories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`font-poppins flex-shrink-0 rounded-md px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${selectedCategory === cat.value
                                                ? 'bg-store-accent/15 text-black border border-store-accent shadow-sm'
                                                : 'bg-white border border-guest-border text-black hover:border-guest-subtle shadow-sm'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {selectedCategory ? (
                        <>
                            {activeCategoryLabel && (
                                <div className="mb-4 space-y-2">
                                    <h3 className="font-poppins text-lg font-bold tracking-wide text-guest-text sm:text-xl uppercase">
                                        {activeCategoryLabel?.toLowerCase() === '1 top' ? 'POPULER' : 'VOUCHER'} {activeCategoryLabel}
                                    </h3>

                                </div>
                            )}
                            {filteredProducts.length > 0 ? (
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
                            )}
                        </>
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
                        <h2 className="text-[1.15rem] min-[380px]:text-xl font-bold uppercase leading-tight text-guest-text sm:text-4xl md:text-5xl whitespace-nowrap sm:whitespace-normal" style={{ letterSpacing: '0.01em' }}>
                            Belanja digital <span className="text-store-accent-dark">aman & cepat</span>
                        </h2>
                        <p className="mt-3 text-sm font-normal leading-normal text-black sm:text-[15px]">
                            Pembayaran terintegrasi, pengiriman key otomatis, dan tim siap membantu jika ada kendala — tanpa janji merek pihak ketiga yang tidak kami kelola.
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
                                <div key={i} className="group flex flex-col items-center rounded-2xl bg-[#1b5d20] p-4 text-center shadow-md transition-all hover:shadow-lg sm:p-5 md:p-6">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-transform group-hover:scale-110 sm:h-11 sm:w-11">
                                        <StatIcon size={22} />
                                    </div>
                                    <span className="text-2xl font-bold tracking-wide text-white sm:text-3xl">{stat.value}</span>
                                    <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
