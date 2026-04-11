import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';

const navLinks = [
    { label: 'Beranda',       href: '/',              icon: 'home'     },
    { label: 'Katalog',       href: '/catalog',       icon: 'products' },
    { label: 'Lacak Pesanan', href: '/track-invoice', icon: 'receipt'  },
];

export default function GuestNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const MenuIcon = AppIcons.menu;
    const CloseIcon = AppIcons.close;

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 bg-white/90 py-2 shadow-md backdrop-blur-xl">
            <div className="section-container">
                <div className="flex h-12 items-center justify-between">
                    <div className="flex items-center gap-12">
                        <AppLogo href="/" size="md" theme="dark" />

                        <div className="hidden items-center gap-4 lg:flex">
                            {navLinks.map((link) => {
                                const Icon = AppIcons[link.icon] || AppIcons.globe;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-guest-muted transition-all duration-300 hover:bg-guest-elevated hover:text-store-accent"
                                    >
                                        <div className="text-guest-subtle transition-colors group-hover:text-store-accent">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wide">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-guest-border bg-guest-elevated text-guest-text transition-all hover:bg-white lg:hidden"
                    >
                        {mobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            </div>

            <div className={`fixed inset-0 top-[88px] z-40 bg-white/98 backdrop-blur-xl transition-all duration-500 ease-spring lg:hidden ${mobileOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
                }`}>
                <div className="section-container space-y-3 py-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center justify-between rounded-2xl border border-guest-border bg-guest-surface p-4 text-base font-bold uppercase tracking-wide text-guest-text shadow-sm transition-all hover:border-store-accent/40 hover:bg-guest-elevated"
                        >
                            <span className="flex items-center gap-4">
                                <span className="text-store-accent transition-colors group-hover:text-store-accent-dark">
                                    <AppIcons.arrowRight size={18} />
                                </span>
                                {link.label}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-guest-border opacity-40 transition-opacity group-hover:opacity-100">
                                <AppIcons.chevronRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
