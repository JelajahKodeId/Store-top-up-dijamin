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
            icon: 'phone',
            href: `https://wa.me/${site.whatsapp.replace(/\D/g, '')}`,
            label: 'WhatsApp',
        },
        site?.instagram && {
            icon: 'instagram',
            href: `https://instagram.com/${site.instagram}`,
            label: 'Instagram',
        },
        site?.facebook && {
            icon: 'facebook',
            href: site.facebook.startsWith('http') ? site.facebook : `https://facebook.com/${site.facebook}`,
            label: 'Facebook',
        },
        site?.tiktok && {
            icon: 'tiktok',
            href: `https://tiktok.com/@${site.tiktok}`,
            label: 'TikTok',
        },
    ].filter(Boolean);

    const description = site?.description || 'Platform top-up game instan 24 jam dengan sistem otomatis yang aman, cepat, dan terpercaya.';
    const siteName = site?.name || 'Mall Store';

    return (
        <footer className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950 text-zinc-300">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-store-accent/5 blur-[100px]" />

            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 gap-10 py-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:py-12">
                    <div className="space-y-4 lg:col-span-2">
                        <AppLogo theme="light" size="lg" href="/" />
                        <p className="max-w-md text-sm font-medium leading-normal text-zinc-400">
                            {description}
                        </p>

                        {socialLinks.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = AppIcons[social.icon] || AppIcons.globe;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={social.label}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-400 transition-colors hover:border-store-accent/50 hover:text-store-accent"
                                        >
                                            <Icon size={18} strokeWidth={2.5} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {site?.whatsapp && (
                            <a
                                href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-green-800/60 bg-green-950/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-green-400 transition-colors hover:bg-green-950/70"
                            >
                                <AppIcons.phone size={14} strokeWidth={2.5} />
                                Hubungi CS via WhatsApp
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-2 lg:grid-cols-2">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">Layanan</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.layanan.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium text-zinc-400 transition-colors hover:text-store-accent"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">Bantuan</h4>
                            <ul className="space-y-2.5">
                                {footerLinks.bantuan.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-medium text-zinc-400 transition-colors hover:text-store-accent"
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
                                            className="text-sm font-medium text-zinc-400 transition-colors hover:text-store-accent"
                                        >
                                            Hubungi CS
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800 py-6 sm:flex-row sm:gap-6">
                    <p className="text-center text-[10px] font-black uppercase leading-normal tracking-[0.2em] text-zinc-500 sm:text-left">
                        &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wide text-green-400/90">Sistem operasional normal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
