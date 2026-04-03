import { usePage } from '@inertiajs/react';
import Avatar from '@/Components/ui/Avatar';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * Admin TopBar — refined lux design with central icons
 */
export default function TopBar({
    title = 'Dashboard',
    subtitle,
    onMenuClick,
    onToggleSidebar,
    isCollapsed
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const CollapseIcon = isCollapsed ? AppIcons.sidebarOpen : AppIcons.sidebarClose;
    const MenuIcon = AppIcons.menu;
    const SearchIcon = AppIcons.search;
    const BellIcon = AppIcons.notification;
    const GlobeIcon = AppIcons.globe;

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-store-border flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
            {/* Left Section */}
            <div className="flex items-center gap-6 min-w-0">
                {/* Desktop Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="hidden lg:flex p-2.5 rounded-xl text-store-muted hover:bg-admin-bg hover:text-store-charcoal transition-all border border-transparent hover:border-store-border"
                    title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                >
                    <CollapseIcon className="w-5 h-5" />
                </button>

                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 rounded-xl text-store-muted hover:bg-admin-bg hover:text-store-charcoal transition-all"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>

                <div className="min-w-0 hidden sm:block">
                    <h1 className="text-lg font-black text-store-charcoal truncate tracking-tight uppercase">{title}</h1>
                    {subtitle && (
                        <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest truncate">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                {/* Quick Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-2 p-1 bg-admin-bg rounded-2xl border border-store-border">
                    <button className="p-2 rounded-xl text-store-muted hover:text-store-charcoal hover:bg-white hover:shadow-soft transition-all">
                        <SearchIcon className="w-4.5 h-4.5" />
                    </button>
                    <button className="p-2 rounded-xl text-store-muted hover:text-store-charcoal hover:bg-white hover:shadow-soft transition-all relative">
                        <BellIcon className="w-4.5 h-4.5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                    <a href="/" target="_blank" className="p-2 rounded-xl text-store-muted hover:text-store-charcoal hover:bg-white hover:shadow-soft transition-all" title="Lihat Toko">
                        <GlobeIcon className="w-4.5 h-4.5" />
                    </a>
                </div>

                {/* User Info */}
                {user && (
                    <div className="flex items-center gap-4 pl-4 sm:pl-6 border-l border-store-border">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-black text-store-charcoal leading-none tracking-tight">{user.name}</p>
                            <p className="text-[10px] font-bold text-store-accent-dark uppercase tracking-widest mt-1">Super Administrator</p>
                        </div>
                        <div className="p-0.5 rounded-full border-2 border-store-accent">
                            <Avatar name={user.name} size="sm" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
