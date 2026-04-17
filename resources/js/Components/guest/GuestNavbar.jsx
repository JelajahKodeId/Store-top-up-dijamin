import { useState, useEffect, useRef } from 'react';
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
    const menuRef = useRef(null);
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

    const navLinkClass =
        'group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-guest-muted transition-colors hover:bg-guest-elevated hover:text-store-accent-dark lg:px-3.5';

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mobileOpen]);

    useEffect(() => {
        setMobileOpen(false);
    }, [page.url]);

    useEffect(() => {
        if (!mobileOpen) return undefined;
        const onPointerDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown, { passive: true });
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
        };
    }, [mobileOpen]);

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-guest-border bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="section-container relative" ref={menuRef}>
                <div className="flex min-h-[4.25rem] items-center justify-between gap-3 py-3 sm:min-h-[4.5rem] sm:py-3.5">
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 lg:gap-8">
                        <AppLogo href={inMemberArea && isMember ? route('member.home') : '/'} size="lg" theme="dark" />

                        {!(inMemberArea && isMember) && (
                            <div className="hidden min-w-0 items-center gap-1 sm:gap-2 lg:flex">
                                {storeLinks.map((link) => {
                                    const Icon = AppIcons[link.icon] || AppIcons.globe;
                                    return (
                                        <Link key={link.href} href={link.href} className={navLinkClass}>
                                            <Icon size={18} strokeWidth={2.5} className="text-guest-subtle group-hover:text-store-accent" />
                                            <span className="hidden lg:inline">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {inMemberArea && isMember && (
                            <div className="hidden items-center gap-1 sm:gap-2 lg:flex">
                                {storeLinks.map((link) => {
                                    const Icon = AppIcons[link.icon] || AppIcons.globe;
                                    return (
                                        <Link key={link.href} href={link.href} className={navLinkClass}>
                                            <Icon size={18} strokeWidth={2.5} className="text-guest-subtle group-hover:text-store-accent" />
                                            <span className="hidden lg:inline">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {!inMemberArea && isMember && (
                            <Link
                                href={route('member.home')}
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-store-accent-dark hover:bg-store-accent/10 lg:inline-flex"
                            >
                                Area member
                            </Link>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
                            {!user && (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-guest-muted transition-colors hover:bg-guest-elevated hover:text-guest-text"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-store-accent px-4 py-2.5 text-sm font-bold text-store-dark shadow-sm transition-colors hover:bg-amber-400"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="rounded-xl border border-guest-border px-4 py-2.5 text-sm font-semibold text-guest-text hover:bg-guest-elevated"
                                >
                                    Panel admin
                                </Link>
                            )}
                            {user && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                >
                                    Keluar
                                </Link>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileOpen((o) => !o)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-guest-border bg-guest-elevated text-guest-text transition-colors hover:bg-white sm:h-12 sm:w-12 lg:hidden"
                            aria-expanded={mobileOpen}
                            aria-haspopup="true"
                            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                        >
                            {mobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile: dropdown biasa di bawah bar (bukan panel full layar) */}
                <div
                    className={`absolute left-0 right-0 top-full z-[60] overflow-hidden border-guest-border bg-white shadow-lg transition-[max-height,opacity] duration-200 ease-out lg:hidden ${
                        mobileOpen
                            ? 'max-h-[min(75vh,22rem)] border-b border-x opacity-100'
                            : 'pointer-events-none max-h-0 border-0 opacity-0'
                    } rounded-b-2xl border-t-0`}
                >
                    <div className="max-h-[min(75vh,22rem)] overflow-y-auto py-1">
                        <ul className="divide-y divide-guest-border">
                            {storeLinks.map((link) => {
                                const Icon = AppIcons[link.icon] || AppIcons.globe;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-guest-text hover:bg-guest-elevated"
                                        >
                                            <Icon size={18} className="shrink-0 text-guest-subtle" />
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                            {!inMemberArea && isMember && (
                                <li>
                                    <Link
                                        href={route('member.home')}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-store-accent-dark hover:bg-store-accent/10"
                                    >
                                        <AppIcons.profile size={18} className="shrink-0 opacity-80" />
                                        Area member
                                    </Link>
                                </li>
                            )}
                        </ul>

                        <div className="border-t border-guest-border bg-guest-bg/40 px-2 py-2">
                            {!user && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-xl border border-guest-border bg-white py-2.5 text-center text-sm font-semibold text-guest-text hover:bg-guest-elevated"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-xl bg-store-accent py-2.5 text-center text-sm font-bold text-store-dark hover:brightness-110"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                            {isAdmin && (
                                <Link
                                    href={route('admin.dashboard')}
                                    onClick={() => setMobileOpen(false)}
                                    className="mt-1 block rounded-xl border border-guest-border bg-white py-2.5 text-center text-sm font-semibold text-guest-text hover:bg-guest-elevated"
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
                                    className="mt-1 block w-full rounded-xl border border-red-100 bg-red-50 py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-100/80"
                                >
                                    Keluar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
