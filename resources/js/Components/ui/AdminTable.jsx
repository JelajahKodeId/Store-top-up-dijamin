import Pagination from '@/Components/ui/Pagination';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * AdminTable — Robust data table container for CRUDs with centralized icons
 */
export default function AdminTable({
    title,
    subtitle,
    headers = [],
    children,
    pagination,
    onSearch,
    searchPlaceholder = "Cari data...",
    loading = false,
    actions
}) {
    const SearchIcon = AppIcons.search;
    const LoaderIcon = AppIcons.loading;
    const EmptyIcon = AppIcons.search; // Or define a specifically empty one

    return (
        <div className="admin-content-card border-none">
            {/* Header section */}
            {(title || onSearch || actions) && (
                <div className="px-6 sm:px-8 py-5 sm:py-7 border-b border-store-border flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="text-sm sm:text-base font-black text-store-charcoal uppercase tracking-tight">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-[10px] sm:text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-1 sm:mt-1.5">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {onSearch && (
                            <div className="relative group w-full sm:min-w-[240px]">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-store-muted group-focus-within:text-store-charcoal transition-colors" size={16} strokeWidth={2.5} />
                                <input
                                    type="text"
                                    onChange={(e) => onSearch(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-admin-bg border-1.5 border-transparent focus:border-store-border focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-store-charcoal placeholder:text-store-subtle outline-none transition-all shadow-inner-sm"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Body */}
            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center animate-fade-in">
                        <div className="flex flex-col items-center gap-3">
                            <LoaderIcon className="w-8 h-8 text-store-charcoal animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-store-charcoal">Memuat Data...</span>
                        </div>
                    </div>
                )}

                <div className="admin-table-container border-none rounded-none overflow-x-auto scrollbar-hide">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {headers.map((header, i) => (
                                    <th key={i} className={header.className}>
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {children}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && (!children || (Array.isArray(children) && children.length === 0)) && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-admin-bg rounded-3xl flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-soft">
                            <EmptyIcon className="w-8 h-8 text-store-subtle opacity-40" />
                        </div>
                        <h4 className="text-base font-black text-store-charcoal uppercase tracking-tight">Tidak Ada Data</h4>
                        <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-2">Coba sesuaikan filter atau pencarian Anda</p>
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {pagination && (
                <div className="border-t border-store-border bg-gray-50/30 rounded-b-3xl">
                    <Pagination links={pagination.links} />
                </div>
            )}
        </div>
    );
}
