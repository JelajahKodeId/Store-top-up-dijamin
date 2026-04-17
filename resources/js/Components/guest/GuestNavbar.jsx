import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';

const storeLinks = [
    { label: 'Beranda toko', href: '/', icon: 'home' },
    { label: 'Katalog', href: '/catalog', icon: 'products' },
    { label: 'Lacak pesanan', href: '/track-invoice', icon: 'receipt' },
];

export default function GuestNavbar({ memberArea = false }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage();
    const { auth } = page.props;
    const user = auth?.user;
    const roles = user?.roles ?? [];
    const isMember = Array.isArray(roles) && roles.includes('member');
    const isAdmin = Array.isArray(roles) && roles.includes('admin');

    const path = (page.url || '').split('?')[0] || '';
    const inMemberArea = memberArea || path.startsWith('/member');

    const MenuIcon = AppIcons.menu;
    const CloseIcon = AppIcons.close;

    const barHeightClass = inMemberArea && isMember ? 'h-11 py-1.5' : 'h-12 py-2';

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-guest-border bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="section-container">
                <div className={`flex items-center justify-between gap-3 ${barHeightClass}`}>
                    <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-6">
                        <AppLogo href={inMemberArea && isMember ? route('member.home') : '/'} size="md" theme="dark" />

                        {!(inMemberArea && isMember) && (
                            <div className="hidden min-w-0 items-center gap-1 lg:flex lg:gap-2">
                                {storeLinks.map((link) => {
                                    const Icon = AppIcons[link.icon] || AppIcons.globe;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="group flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-guest-muted transition-colors hover:bg-guest-elevated hover:text-store-accent-dark xl:px-3"
                                        >
                                            <Icon size={17} strokeWidth={2.5} className="text-guest-subtle group-hover:text-store-accent" />
                                            <span className="hidden xl:inline">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {inMemberArea && isMember && (
                            <div className="hidden items-center gap-1 lg:flex">
                                {storeLinks.map((link) => {
                                    const Icon = AppIcons[link.icon] || AppIcons.globe;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-guest-muted transition-colors hover:bg-guest-elevated hover:text-guest-text"
                                        >
                                            <Icon size={16} strokeWidth={2.5} className="opacity-70" />
                                            <span className="hidden sm:inline">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {!inMemberArea && isMember && (
                            <Link
                                href={route('member.home')}
                                className="hidden rounded-lg px-3 py-1.5 text-xs font-semibold text-store-accent-dark hover:bg-store-accent/10 lg:inline-flex"
                            >
                                Area member
                            </Link>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div className="hidden items-center gap-2 sm:flex">
                            {!user && (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-guest-muted transition-colors hover:bg-guest-elevated hover:text-guest-text"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-store-accent px-3 py-2 text-xs font-bold text-store-dark shadow-sm transition-colors hover:bg-amber-400"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="rounded-lg border border-guest-border px-3 py-2 text-xs font-semibold text-guest-text hover:bg-guest-elevated"
                                >
                                    Panel admin
                                </Link>
                            )}
                            {user && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                    Keluar
                                </Link>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-guest-border bg-guest-elevated text-guest-text transition-colors hover:bg-white lg:hidden"
                            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                        >
                            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`fixed inset-0 top-16 z-40 border-t border-guest-border bg-white shadow-lg transition-all duration-200 ease-out lg:hidden ${
                    mobileOpen ? 'pointer-events-auto translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
                }`}
            >
                <div className="section-container max-h-[calc(100dvh-4rem)] space-y-2 overflow-y-auto py-4">
                    {storeLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between rounded-xl border border-guest-border bg-guest-surface px-4 py-3 text-sm font-semibold text-guest-text"
                        >
                            {link.label}
                            <AppIcons.chevronRight size={16} className="text-guest-subtle" />
                        </Link>
                    ))}

                    {!inMemberArea && isMember && (
                        <Link
                            href={route('member.home')}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-xl border border-store-accent/25 bg-store-accent/10 px-4 py-3 text-center text-sm font-semibold text-store-accent-dark"
                        >
                            Area member
                        </Link>
                    )}

                    {!user && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Link
                                href={route('login')}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl border border-guest-border py-3 text-center text-sm font-semibold text-guest-text"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={route('register')}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl bg-store-accent py-3 text-center text-sm font-bold text-store-dark"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                    {isAdmin && (
                        <Link
                            href={route('admin.dashboard')}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-xl border border-guest-border py-3 text-center text-sm font-semibold"
                        >
                            Panel admin
                        </Link>
                    )}
                    {user && (
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={() => setMobileOpen(false)}
                            className="block w-full rounded-xl border border-red-100 bg-red-50 py-3 text-center text-sm font-semibold text-red-700"
                        >
                            Keluar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
