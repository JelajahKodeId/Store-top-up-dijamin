import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import Avatar from '@/Components/ui/Avatar';

const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Katalog', href: '/catalog' },
    { label: 'Promo', href: '/promo' },
    { label: 'Panduan', href: '/guide' },
];

/**
 * GuestLayout — layout untuk halaman publik (landing, catalog, dll)
 */
export default function GuestLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-store-bg font-sans">
            {/* ══ Navbar ══════════════════════════════════════════════════════ */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-store-border'
                : 'bg-white border-b border-store-border'
                }`}>
                <div className="section-container">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <AppLogo href="/" size="md" />

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-4 py-2 text-sm font-semibold text-store-muted hover:text-store-dark hover:bg-store-surface-2 rounded-xl transition-all duration-150"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right actions - Removed Login/Register/Dashboard as they are admin-only now */}
                        <div className="flex items-center gap-2">
                            {/* Mobile hamburger */}
                            <button
                                className="md:hidden p-2 rounded-xl text-store-muted hover:text-store-dark hover:bg-store-surface-2 transition-all"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label="Menu"
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

                {/* Mobile menu dropdown */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-store-border bg-white animate-fade-in">
                        <div className="section-container py-3 space-y-0.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 text-sm font-semibold text-store-muted hover:text-store-dark hover:bg-store-surface-2 rounded-xl transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* ══ Main Content ═══════════════════════════════════════════════ */}
            <main>{children}</main>

            {/* ══ Footer ═════════════════════════════════════════════════════ */}
            <footer className="bg-store-dark text-white mt-20">
                <div className="section-container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <AppLogo theme="light" size="md" href="/" className="mb-4" />
                            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                                Platform top-up game instan 24 jam dengan sistem otomatis yang aman, cepat, dan terpercaya.
                            </p>
                        </div>
                        {/* Links */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Layanan</h4>
                            <ul className="space-y-2">
                                {['Katalog Game', 'Cara Top-up', 'Promo', 'Panduan'].map((t) => (
                                    <li key={t}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Bantuan</h4>
                            <ul className="space-y-2">
                                {['Syarat & Ketentuan', 'Kebijakan Privasi', 'FAQ', 'Hubungi Kami'].map((t) => (
                                    <li key={t}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
                        <span>&copy; {new Date().getFullYear()} Mall Store. All rights reserved.</span>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                            <span>Semua sistem normal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
