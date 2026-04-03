import { Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * Pagination — clean and professional with centralized icons
 */
export default function Pagination({ links }) {
    // Jika hanya ada 1 halaman (previous & next saja), sembunyikan
    if (links.length <= 3) return null;

    const ChevronLeftIcon = AppIcons.chevronLeft;
    const ChevronRightIcon = AppIcons.chevronRight;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-6 sm:p-8">
            {links.map((link, index) => {
                const isPrev = index === 0;
                const isNext = index === links.length - 1;

                // Ganti label "&laquo; Previous" dan "Next &raquo;" dengan Icon
                let label = link.label;
                if (isPrev) label = <ChevronLeftIcon size={16} strokeWidth={2.5} />;
                if (isNext) label = <ChevronRightIcon size={16} strokeWidth={2.5} />;

                if (link.url === null) {
                    return (
                        <div
                            key={index}
                            className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest text-store-muted/40 border border-transparent select-none`}
                            dangerouslySetInnerHTML={typeof label === 'string' ? { __html: label } : undefined}
                        >
                            {typeof label !== 'string' ? label : null}
                        </div>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`
                            min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 border-1.5
                            ${link.active
                                ? 'bg-store-charcoal text-white border-store-charcoal shadow-lux scale-110 z-10'
                                : 'bg-white text-store-muted border-store-border hover:border-store-charcoal hover:text-store-charcoal active:scale-95'
                            }
                        `.trim()}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
