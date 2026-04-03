import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * Breadcrumbs — hierarchical navigation with centralized icons
 */
export default function Breadcrumbs({ items = [] }) {
    const ChevronRightIcon = AppIcons.chevronRight;
    const HomeIcon = AppIcons.home;

    return (
        <nav className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] overflow-x-auto scrollbar-hide py-1">
            <a
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-store-muted hover:text-store-charcoal transition-colors group"
            >
                <div className="w-6 h-6 bg-admin-bg rounded-lg flex items-center justify-center group-hover:bg-store-border transition-colors">
                    <HomeIcon size={12} strokeWidth={3} />
                </div>
                {!items.length && <span>Dashboard</span>}
            </a>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2.5 shrink-0">
                    <ChevronRightIcon size={12} className="text-store-subtle/50" />

                    {item.href ? (
                        <a
                            href={item.href}
                            className="text-store-muted hover:text-store-charcoal transition-colors"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className="text-store-charcoal drop-shadow-sm">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
