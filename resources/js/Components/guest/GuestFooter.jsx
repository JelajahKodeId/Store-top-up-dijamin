import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';

const footerLinks = {
    layanan: [
        { label: 'Beranda',        href: '/' },
        { label: 'Katalog Produk', href: '/catalog' },
        { label: 'Lacak Pesanan',  href: '/track-invoice' },
    ],
    bantuan: [
        // Uncomment jika halaman sudah dibuat:
        // { label: 'Syarat & Ketentuan', href: '/terms' },
        // { label: 'Kebijakan Privasi', href: '/privacy' },
        // { label: 'FAQ', href: '/faq' },
    ],
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
    const siteName    = site?.name || 'Mall Store';

    return (
        <footer className="bg-store-charcoal border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-store-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <AppLogo theme="light" size="lg" href="/" />
                        <p className="text-store-subtle text-base leading-relaxed max-w-md font-medium opacity-80">
                            {description}
                        </p>

                        {/* Social Links dari settings */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-4 flex-wrap">
                                {socialLinks.map((social) => {
                                    const Icon = AppIcons[social.icon] || AppIcons.globe;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={social.label}
                                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-store-accent hover:border-store-accent/30 hover:bg-store-accent/10 transition-all duration-500 hover:-translate-y-1 shadow-lg"
                                        >
                                            <Icon size={20} strokeWidth={2.5} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* WhatsApp CS quick link */}
                        {site?.whatsapp && (
                            <a
                                href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-[10px] font-bold uppercase tracking-widest"
                            >
                                <AppIcons.phone size={14} strokeWidth={2.5} />
                                Hubungi CS via WhatsApp
                            </a>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-12 lg:col-span-2">
                        <div className="space-y-8">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Layanan</h4>
                            <ul className="space-y-4">
                                {footerLinks.layanan.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm font-medium text-store-subtle hover:text-store-accent transition-all duration-300">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Bantuan</h4>
                            <ul className="space-y-4">
                                {footerLinks.bantuan.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm font-medium text-store-subtle hover:text-store-accent transition-all duration-300">
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
                                            className="text-sm font-medium text-store-subtle hover:text-store-accent transition-all duration-300"
                                        >
                                            Hubungi CS
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] text-center md:text-left leading-relaxed">
                        &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-green-500/80 uppercase tracking-widest">Sistem Operasional Normal</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
