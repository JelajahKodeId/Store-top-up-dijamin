import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';

const footerLinks = {
    layanan: [
        { label: 'Beranda', href: '/' },
        { label: 'Katalog Produk', href: '/catalog' },
        { label: 'Lacak Pesanan', href: '/track-invoice' },
    ],
    bantuan: [],
};

export default function GuestFooter() {
    const { site } = usePage().props;

    const csWaHref = site?.whatsapp
        ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}`
        : null;

    const socialLinks = [
        site?.whatsapp && {
            imgSrc: '/img/logo/whatsapp.webp',
            href: `https://wa.me/${site.whatsapp.replace(/\D/g, '')}`,
            label: 'WhatsApp',
        },
        site?.telegram && {
            imgSrc: '/img/logo/telegram.webp',
            href: `https://t.me/${site.telegram}`,
            label: 'Telegram',
        },
        site?.facebook && {
            imgSrc: '/img/logo/facebook.png',
            href: site.facebook.startsWith('http') ? site.facebook : `https://facebook.com/${site.facebook}`,
            label: 'Facebook',
        },
        site?.tiktok && {
            imgSrc: '/img/logo/tiktok.png',
            href: `https://tiktok.com/@${site.tiktok}`,
            label: 'TikTok',
        },
    ].filter(Boolean);

    const description = site?.description || 'Mallstore.id adalah sebuah panel penyedia layanan topup games terbaik #1 Indonesia, dengan harga termurah dan proses super instan';
    const siteName = site?.name || 'Mall Store';

    const { shared_footer_data } = usePage().props;
    const gameImages = shared_footer_data?.game_images || [];
    const paymentChannels = shared_footer_data?.payment_channels || [];

    return (
        <footer className="relative overflow-hidden border-t border-green-800 bg-[#1b5d20] text-green-50">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-store-accent/5 blur-[100px]" />

            <div className="section-container relative z-10 pt-10">

                {/* --- Running Images Section --- */}
                <div className="mb-10 space-y-8">
                    {/* Game Images Marquee */}
                    {gameImages.length > 0 && (
                        <div className="flex flex-col space-y-3">
                            <h4 className="font-poppins text-[13px] font-black uppercase tracking-[0.25em] text-white">GAME POPULER</h4>
                            <div className="relative flex w-full overflow-hidden">
                                <div className="flex w-max animate-scroll gap-4 hover:[animation-play-state:paused]">
                                    <div className="flex shrink-0 gap-4">
                                        {gameImages.map((game, index) => (
                                            <div
                                                key={`game1-${index}`}
                                                className="group relative flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-green-700/50 bg-black/20 transition-colors hover:border-white sm:h-20 sm:w-40"
                                            >
                                                {game.image_url ? (
                                                    <img src={game.image_url} alt={game.name} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100" />
                                                ) : (
                                                    <AppIcons.image size={20} className="text-green-200/50" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex shrink-0 gap-4">
                                        {gameImages.map((game, index) => (
                                            <div
                                                key={`game2-${index}`}
                                                className="group relative flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-green-700/50 bg-black/20 transition-colors hover:border-white sm:h-20 sm:w-40"
                                            >
                                                {game.image_url ? (
                                                    <img src={game.image_url} alt={game.name} className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100" />
                                                ) : (
                                                    <AppIcons.image size={20} className="text-green-200/50" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Methods Marquee (Shows 3 items constraint) */}
                    {paymentChannels.length > 0 && (
                        <div className="flex flex-col space-y-3">
                            <h4 className="font-poppins text-[13px] font-black uppercase tracking-[0.25em] text-white">Metode Pembayaran</h4>
                            {/* Max width set to ~3 items width (3*w-24 = 288px + 2*gap-4 = 320px) */}
                            <div className="relative flex w-full max-w-[320px] overflow-hidden">
                                <div className="flex w-max animate-scroll gap-4 hover:[animation-play-state:paused]">
                                    <div className="flex shrink-0 gap-4">
                                        {paymentChannels.map((method) => (
                                            <div
                                                key={`pay1-${method.code}`}
                                                className="flex h-12 w-24 shrink-0 items-center justify-center rounded-sm border border-green-700/50 bg-white px-2 py-1"
                                                title={method.label}
                                            >
                                                {method.icon_url ? (
                                                    <img src={method.icon_url} alt={method.label} className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <span className="truncate text-center text-[9px] font-bold uppercase text-zinc-900">{method.label}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex shrink-0 gap-4">
                                        {paymentChannels.map((method) => (
                                            <div
                                                key={`pay2-${method.code}`}
                                                className="flex h-12 w-24 shrink-0 items-center justify-center rounded-sm border border-green-700/50 bg-white px-2 py-1"
                                                title={method.label}
                                            >
                                                {method.icon_url ? (
                                                    <img src={method.icon_url} alt={method.label} className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <span className="truncate text-center text-[9px] font-bold uppercase text-zinc-900">{method.label}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Optional fade gradient on edges to hide sharp cuts */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#1b5d20] to-transparent" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#1b5d20] to-transparent" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-10 border-t border-green-700/50 pt-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4">

                    <div className="space-y-4 lg:col-span-2">
                        <AppLogo theme="light" size="lg" href="/" subtitle="Layanan Voucher Game, Media Sosial" subtitleClassName="text-white" />
                        <p className="max-w-md text-sm font-medium leading-normal text-white">
                            {description}
                        </p>

                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon ? (AppIcons[social.icon] || AppIcons.globe) : null;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={social.label}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-700/50 bg-black/20 text-white transition-colors hover:border-white hover:text-white"
                                        >
                                            {social.imgSrc ? (
                                                <img src={social.imgSrc} alt={social.label} className="h-[22px] w-[22px] object-contain" />
                                            ) : (
                                                <Icon size={18} strokeWidth={2.5} />
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="hidden md:grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-2 lg:grid-cols-2">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Layanan</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.layanan.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium text-white transition-colors hover:text-white/80"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Bantuan</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.bantuan.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium text-white transition-colors hover:text-white/80"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                {csWaHref && (
                                    <li>
                                        <a
                                            href={csWaHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-white transition-colors hover:text-white/80"
                                        >
                                            Hubungi CS
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-green-700/50 py-6 sm:flex-row sm:gap-6">
                    <p className="text-center text-[10px] font-black uppercase leading-normal tracking-[0.2em] text-white sm:text-left">
                        &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3 rounded-xl border border-green-700/50 bg-black/20 px-4 py-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wide text-white">Sistem operasional normal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
