import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import Avatar from '@/Components/ui/Avatar';
import Dropdown from '@/Components/Dropdown';

const memberNavLinks = [
    { label: 'Beranda', href: '/', route: null },
    { label: 'Dashboard', href: route('admin.dashboard'), route: 'admin.dashboard' },
];

function isActive(routeName) {
    try { return routeName && route().current(routeName); } catch { return false; }
}

/**
 * AuthenticatedLayout — layout untuk member yang sudah login
 */
export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-store-bg font-sans">
            {/* ══ Navbar ══════════════════════════════════════════════════════ */}
            <nav className="sticky top-0 z-50 bg-white border-b border-store-border shadow-soft">
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <AppLogo href="/" size="md" />

                        {/* Desktop nav */}
                        <div className="hidden sm:flex items-center gap-1">
                            {memberNavLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${isActive(link.route)
                                            ? 'text-store-dark bg-admin-bg'
                                            : 'text-store-muted hover:text-store-dark hover:bg-admin-bg'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* User dropdown */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-store-border hover:bg-admin-bg transition-all text-sm font-semibold text-store-body">
                                            <Avatar name={user?.name ?? ''} size="sm" />
                                            <span className="hidden sm:block max-w-[120px] truncate">{user?.name}</span>
                                            <svg className="w-4 h-4 text-store-subtle" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="bg-white border border-store-border shadow-popover rounded-2xl overflow-hidden min-w-[200px] py-1.5">
                                        {/* User info */}
                                        <div className="px-4 py-3 border-b border-store-border mb-1">
                                            <p className="text-xs text-store-subtle">Masuk sebagai</p>
                                            <p className="text-sm font-bold text-store-dark truncate">{user?.email}</p>
                                        </div>
                                        <Dropdown.Link
                                            href={route('admin.profile.edit')}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-store-body hover:bg-admin-bg hover:text-store-dark transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-store-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profil Saya
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full border-t border-store-border mt-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Keluar
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                className="sm:hidden p-2 rounded-xl text-store-muted hover:bg-admin-bg transition-all"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    }
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-store-border bg-white animate-fade-in">
                        <div className="section-container py-3 space-y-0.5">
                            {memberNavLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 text-sm font-semibold text-store-muted hover:text-store-dark hover:bg-admin-bg rounded-xl"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-store-border pt-2 mt-2 space-y-0.5">
                                <Link href={route('admin.profile.edit')} className="block px-4 py-3 text-sm font-semibold text-store-body hover:bg-admin-bg rounded-xl">
                                    Profil Saya
                                </Link>
                                <Link
                                    href={route('logout')} method="post" as="button"
                                    className="block w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                    Keluar
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Header (optional) */}
            {header && (
                <div className="bg-white border-b border-store-border">
                    <div className="section-container py-6">
                        {header}
                    </div>
                </div>
            )}

            {/* Main */}
            <main className="section-container py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
