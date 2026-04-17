import { Link, usePage } from '@inertiajs/react';
import { isMemberNavActive, memberNavItems } from '@/Components/member/memberNavConfig';

export default function MemberSubnav() {
    const { auth } = usePage().props;
    if (!auth?.user?.roles?.includes?.('member')) {
        return null;
    }

    return (
        <div className="border-b border-guest-border bg-white/80 backdrop-blur-sm">
            <div className="section-container">
                <nav className="-mb-px flex gap-0 overflow-x-auto pt-1 scrollbar-hide" aria-label="Menu member">
                    {memberNavItems.map((item) => {
                        const active = isMemberNavActive(item);
                        return (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                                    active
                                        ? 'border-store-accent text-store-accent-dark'
                                        : 'border-transparent text-guest-muted hover:border-guest-border hover:text-guest-text'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
