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
                <div className="flex w-full items-center justify-between">
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
                    <div className="hidden sm:flex shrink-0 items-center justify-center border-b-2 border-transparent px-3 py-3">
                        <span className="text-sm font-bold text-guest-text border border-guest-border bg-guest-surface px-3 py-1 rounded-full shadow-sm">
                            Saldo: <span className="text-store-accent-dark">Rp {new Intl.NumberFormat('id-ID').format(auth?.user?.balance || 0)}</span>
                        </span>
                    </div>
                </div>
            </div>
            {/* Tampilkan di mobile juga */}
            <div className="sm:hidden px-4 md:px-8 py-2 bg-guest-surface border-t border-guest-border flex justify-between items-center text-xs shadow-inner">
                <span className="font-semibold text-guest-muted">Saldo Tersedia:</span>
                <span className="font-bold text-store-accent-dark">Rp {new Intl.NumberFormat('id-ID').format(auth?.user?.balance || 0)}</span>
            </div>
        </div>
    );
}
