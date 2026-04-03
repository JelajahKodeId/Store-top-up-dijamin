import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * StatCard — Refined lux admin dashboard stat card with central icon support
 */
export default function StatCard({ label, value, sub, trend = 'neutral', icon, accent = 'gray', href }) {
    const accentColors = {
        gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        yellow: { bg: 'bg-store-accent/10', text: 'text-store-accent-dark' },
        green: { bg: 'bg-green-50', text: 'text-green-700' },
        red: { bg: 'bg-red-50', text: 'text-red-700' },
    };

    const trendConfig = {
        up: { color: 'text-green-600', icon: 'chevronUp', bg: 'bg-green-50' },
        down: { color: 'text-red-500', icon: 'chevronDown', bg: 'bg-red-50' },
        neutral: { color: 'text-store-muted', icon: 'minus', bg: 'bg-gray-50' },
    };

    // Helper untuk mengambil ikon dari registry
    const getIcon = (iconName) => {
        if (typeof iconName === 'string') {
            return AppIcons[iconName] || AppIcons.info;
        }
        return iconName; // Support direct component passing
    };

    const ac = accentColors[accent] ?? accentColors.gray;
    const tc = trendConfig[trend] ?? trendConfig.neutral;

    // Icons
    const Icon = getIcon(icon);

    const CardContent = (
        <>
            {/* Decorative background element */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${ac.bg}`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${ac.bg} ${ac.text}`}>
                        {Icon && <Icon className="w-6 h-6" />}
                    </div>

                    {sub && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${tc.bg} ${tc.color}`}>
                            {sub}
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <p className="text-[11px] font-bold text-store-subtle uppercase tracking-[0.15em] mb-1.5 group-hover:text-store-charcoal transition-colors">{label}</p>
                    <h3 className="text-3xl font-black text-store-charcoal tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                        {value}
                    </h3>
                </div>
            </div>
        </>
    );

    const className = `store-card-lux p-6 relative overflow-hidden group block transition-all duration-300 ${href ? 'hover:shadow-lux hover:-translate-y-1' : ''}`;

    if (href) {
        return (
            <Link href={href} className={className}>
                {CardContent}
            </Link>
        );
    }

    return (
        <div className={className}>
            {CardContent}
        </div>
    );
}
