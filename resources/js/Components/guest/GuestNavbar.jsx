import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';

const navLinks = [
    { label: 'Beranda',       href: '/',              icon: 'home'    },
    { label: 'Katalog',       href: '/catalog',       icon: 'products'},
    { label: 'Lacak Pesanan', href: '/track-invoice', icon: 'receipt' },
];

export default function GuestNavbar() {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const MenuIcon = AppIcons.menu;
    const CloseIcon = AppIcons.close;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 py-2 bg-store-charcoal/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
            <div className="section-container">
                <div className="flex items-center justify-between h-12">
                    {/* Brand */}
                    <div className="flex items-center gap-12">
                        <AppLogo href="/" size="md" theme="light" />

                        <div className="hidden lg:flex items-center gap-4">
                            {navLinks.map((link) => {
                                const Icon = AppIcons[link.icon] || AppIcons.globe;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl text-sm font-bold text-white/60 hover:text-store-accent hover:bg-white/5 transition-all duration-300"
                                    >
                                        <div className="text-white/30 group-hover:text-store-accent transition-colors">
                                            <Icon size={18} strokeWidth={2.5} />
                                        </div>
                                        <span className="uppercase tracking-widest text-[10px] font-black">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4">
                            {auth?.user && (
                                <Link href={route('admin.dashboard')}>
                                    <Button variant="dark" className="px-6 py-3 rounded-2xl bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-store-accent hover:text-store-dark transition-all shadow-lg">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                        >
                            {mobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 top-[88px] bg-store-charcoal/98 backdrop-blur-3xl transition-all duration-500 ease-spring ${mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                }`}>
                <div className="section-container py-12 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 text-xl font-black text-white uppercase tracking-wide hover:bg-store-accent hover:text-store-dark transition-all group"
                        >
                            <span className="flex items-center gap-4">
                                <span className="text-store-accent group-hover:text-store-dark transition-colors">
                                    <AppIcons.arrowRight size={24} />
                                </span>
                                {link.label}
                            </span>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-20 group-hover:opacity-100">
                                <AppIcons.chevronRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
