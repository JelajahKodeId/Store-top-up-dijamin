import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function CategoryShow({ category }) {
    const categoryData = category;

    const BackIcon = AppIcons.chevronLeft;
    const TagIcon = AppIcons.categories;
    const BoxIcon = AppIcons.products;

    return (
        <AdminLayout
            title="Detail Kategori"
            subtitle={`Informasi lengkap kategori: ${categoryData?.name}`}
        >
            <Head title={`Detail Kategori - ${categoryData?.name}`} />

            <div className="mb-8">
                <Link
                    href={route('admin.categories.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Kembali ke Daftar
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="admin-content-card p-8">
                        <div className="w-full aspect-square rounded-3xl bg-admin-bg border border-store-border flex items-center justify-center overflow-hidden mb-6">
                            {categoryData?.image_url ? (
                                <img src={categoryData?.image_url} alt={categoryData?.name} className="w-full h-full object-cover" />
                            ) : (
                                <TagIcon size={48} className="text-store-muted" />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-store-charcoal tracking-tight text-center">{categoryData?.name}</h3>
                        <p className="text-[10px] text-store-subtle uppercase font-bold tracking-widest text-center mt-1">{categoryData?.slug}</p>

                        <div className="mt-6 flex justify-center">
                            <Badge variant={categoryData.is_active ? 'accent' : 'gray'} className="px-6 py-1.5 text-[10px]">
                                {categoryData.is_active ? 'Status: Aktif' : 'Status: Non-aktif'}
                            </Badge>
                        </div>
                    </div>

                    <div className="admin-content-card p-6">
                        <h4 className="text-[10px] font-black text-store-muted uppercase tracking-[0.2em] mb-4">Statistik Kategori</h4>
                        <div className="flex items-center gap-4 p-4 bg-admin-bg rounded-2xl border border-store-border">
                            <div className="w-10 h-10 rounded-xl bg-store-accent flex items-center justify-center text-store-charcoal">
                                <BoxIcon size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider">Total Produk</span>
                                <span className="text-lg font-black text-store-charcoal">{categoryData.products_count || 0} Produk</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="admin-content-card h-full">
                        <div className="px-8 py-6 border-b border-store-border">
                            <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Informasi & Deskripsi</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-black text-store-muted uppercase tracking-widest">Deskripsi Kategori</h5>
                                <p className="text-sm text-store-charcoal leading-relaxed font-medium">
                                    {categoryData.description || 'Tidak ada deskripsi untuk kategori ini.'}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-store-border border-dashed space-y-3">
                                <h5 className="text-[10px] font-black text-store-muted uppercase tracking-widest">Metadata Sistem</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <span className="text-[9px] font-bold text-store-subtle uppercase block mb-1">Dibuat Pada</span>
                                        <span className="text-xs font-black text-store-charcoal">{categoryData.created_at}</span>
                                    </div>
                                    <div className="p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <span className="text-[9px] font-bold text-store-subtle uppercase block mb-1">Slug URL</span>
                                        <span className="text-xs font-black text-store-charcoal">/{categoryData.slug}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
