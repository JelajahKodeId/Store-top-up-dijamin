import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function ProductShow({ product }) {
    const productData = product;

    const BackIcon = AppIcons.chevronLeft;
    const TagIcon = AppIcons.categories;
    const BoxIcon = AppIcons.products;
    const InfoIcon = AppIcons.info;

    return (
        <AdminLayout
            title="Detail Produk"
            subtitle={`Kelola informasi paket: ${productData?.name}`}
        >
            <Head title={`Product Detail - ${productData?.name}`} />

            <div className="mb-8">
                <Link
                    href={route('admin.products.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Kembali ke Daftar
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Info Card */}
                    <div className="admin-content-card p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-admin-bg border border-store-border flex items-center justify-center text-store-muted shadow-soft">
                                    <BoxIcon size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-black text-store-charcoal tracking-tighter">{productData?.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="charcoal" className="text-[9px] uppercase tracking-widest">{productData?.sku}</Badge>
                                        <span className="text-[10px] font-bold text-store-subtle uppercase">Kategori: {productData?.category?.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-widest mb-1">Harga Satuan</span>
                                <span className="text-2xl font-black text-store-accent">{productData?.discount_price_formatted || productData?.price_formatted}</span>
                                {productData?.discount_price && (
                                    <span className="text-xs font-bold text-store-subtle line-through opacity-60">{productData?.price_formatted}</span>
                                )}
                            </div>
                        </div>

                        <hr className="my-8 border-store-border border-dashed" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-store-muted uppercase tracking-widest flex items-center gap-2">
                                    <InfoIcon size={12} /> Status & Ketersediaan
                                </h5>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <span className="text-xs font-bold text-store-charcoal">Status Visibilitas</span>
                                        <Badge variant={productData.is_active ? 'accent' : 'gray'}>
                                            {productData.is_active ? 'Tampil' : 'Sembunyi'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <span className="text-xs font-bold text-store-charcoal">Stok Barang</span>
                                        <Badge variant={productData.is_available ? 'charcoal' : 'gray'}>
                                            {productData.is_available ? 'Tersedia' : 'Habis'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-store-muted uppercase tracking-widest flex items-center gap-2">
                                    <TagIcon size={12} /> Informasi Lainnya
                                </h5>
                                <div className="p-4 bg-store-charcoal text-white rounded-2xl border border-store-border-dark space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-store-muted uppercase">ID Database</span>
                                        <span className="text-sm font-black font-mono">#{productData.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-store-muted uppercase">Sinkronisasi</span>
                                        <span className="text-sm font-black">Manual Input</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Category Quick View */}
                    <div className="admin-content-card p-6 bg-indigo-50 border-indigo-100">
                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-4">Relasi Kategori</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                <img src={productData.category?.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-indigo-900">{productData.category?.name}</span>
                                <Link
                                    href={route('admin.categories.show', productData.category?.id)}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline mt-1"
                                >
                                    Lihat Semua Paket Di Kategori Ini
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
