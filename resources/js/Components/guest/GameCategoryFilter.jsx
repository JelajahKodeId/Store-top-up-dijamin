import { Link } from '@inertiajs/react';

/**
 * Chip filter kategori game (query `?category=slug`). `routeName`: `home` | `catalog`.
 */
export default function GameCategoryFilter({ routeName = 'home', categories = [], currentCategory = null }) {
    if (!categories?.length) {
        return null;
    }

    const chipBase =
        'inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all';
    const inactive = `${chipBase} border-guest-border bg-white text-guest-muted hover:border-store-accent/40 hover:bg-store-accent/5 hover:text-guest-text`;
    const active = `${chipBase} border-store-accent bg-store-accent/15 text-store-accent-dark shadow-sm`;

    return (
        <div className="mb-6 flex flex-col gap-3 sm:mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-guest-subtle">Filter game</p>
            <div className="flex flex-wrap gap-2">
                <Link href={route(routeName)} preserveScroll className={!currentCategory ? active : inactive}>
                    Semua
                </Link>
                {categories.map((c) => (
                    <Link
                        key={c.value}
                        href={route(routeName, { category: c.value })}
                        preserveScroll
                        className={currentCategory === c.value ? active : inactive}
                    >
                        {c.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
