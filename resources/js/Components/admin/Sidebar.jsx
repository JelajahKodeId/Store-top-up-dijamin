import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

const navItems = [
    {
        section: 'Menu Utama',
        items: [
            {
                label: 'Dashboard',
                route: 'admin.dashboard',
                icon: 'dashboard',
            },
        ],
    },
    {
        section: 'Katalog',
        items: [
            {
                label: 'Produk & Paket',
                route: 'admin.products.index',
                icon: 'products',
            },
        ],
    },
    {
        section: 'Transaksi',
        items: [
            {
                label: 'Semua Order',
                route: 'admin.orders.index',
                icon: 'orders',
            },
        ],
    },
    {
        section: 'Promosi',
        items: [
            {
                label: 'Voucher',
                route: 'admin.vouchers.index',
                icon: 'vouchers',
            },
            {
                label: 'Banner Promo',
                route: 'admin.banners.index',
                icon: 'banners',
            },
        ],
    },
    {
        section: 'Pengaturan',
        items: [
            {
                label: 'Pengaturan Situs',
                route: 'admin.settings.index',
                icon: 'settings',
            },
            {
                label: 'WhatsApp',
                route: 'admin.whatsapp.index',
                icon: 'phone',
            },
            {
                label: 'Manajemen Pengguna',
                route: 'admin.users.index',
                icon: 'users',
            },
            {
                label: 'Profil Saya',
                route: 'admin.profile.edit',
                icon: 'profile',
            },
        ],
    },
];

function isActive(routeName) {
    try { return route().current(routeName); } catch { return false; }
}

function safePath(routeName) {
    try { return route(routeName); } catch { return '#'; }
}

export default function Sidebar({ isCollapsed, onClose, isMobile }) {
    const BrandIcon = AppIcons.dashboard;
    const CloseIcon = AppIcons.close;

    return (
        <div className="flex flex-col h-full bg-store-charcoal relative z-[70]">
            {/* ── Brand ── */}
            <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} px-6 py-8 border-b border-store-border-dark flex-shrink-0 transition-all duration-300`}>
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-store-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-accent-glow">
                        <BrandIcon className="w-5 h-5 text-store-charcoal" />
                    </div>
                    {!isCollapsed || isMobile ? (
                        <span className="font-black text-white text-base tracking-tighter uppercase">
                            Admin <span className="text-store-accent">Portal</span>
                        </span>
                    ) : null}
                </Link>

                {isMobile && onClose && (
                    <button onClick={onClose} className="text-store-muted hover:text-white p-2 rounded-lg bg-store-charcoal-light transition-all">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto scrollbar-hide px-4 py-8 space-y-8">
                {navItems.map((group) => (
                    <div key={group.section} className="space-y-2">
                        {!isCollapsed || isMobile ? (
                            <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-store-muted/60">
                                {group.section}
                            </p>
                        ) : (
                            <div className="h-px bg-store-border-dark mx-2 mb-4" />
                        )}

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = AppIcons[item.icon] || AppIcons.info;
                                const active = isActive(item.route);

                                return (
                                    <Link
                                        key={item.label}
                                        href={safePath(item.route)}
                                        className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${active
                                            ? 'bg-store-accent text-store-charcoal shadow-accent-glow'
                                            : 'text-store-muted hover:bg-store-charcoal-light hover:text-white'
                                            } ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}`}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-store-charcoal' : 'group-hover:scale-110 transition-transform'}`} />
                                        {!isCollapsed || isMobile ? (
                                            <span className="flex-1 truncate">{item.label}</span>
                                        ) : null}
                                        {active && (!isCollapsed || isMobile) && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-store-charcoal shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
}
