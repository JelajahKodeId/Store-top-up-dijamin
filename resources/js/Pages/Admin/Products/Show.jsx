import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function ProductShow({ product }) {
    const p = product.data || product;

    return (
        <AdminLayout
            title="Detail Produk"
            subtitle={`Kelola stok key dan pantau status ${p.name}`}
        >
            <Head title={`Detail - ${p.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-store-charcoal tracking-tighter">{p.name}</h2>
                                <p className="text-store-subtle text-sm font-bold">{p.slug}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.products.edit', p.id)}>
                                    <Button variant="ghost" size="sm" icon={AppIcons.edit}>Edit</Button>
                                </Link>
                                <Badge variant={p.status === 'active' ? 'accent' : 'gray'}>
                                    {p.status === 'active' ? 'Aktif' : 'Draft'}
                                </Badge>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-store-charcoal font-medium">
                            <p>{p.description || 'Tidak ada deskripsi.'}</p>
                        </div>
                    </div>

                    {/* Varian & Stok */}
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-6">
                        <h3 className="font-black text-store-charcoal uppercase tracking-tighter text-lg">Pilihan Durasi & Stok Key</h3>
                        <div className="space-y-4">
                            {p.durations.map((d) => (
                                <div key={d.id} className="p-6 bg-admin-bg rounded-2xl border border-store-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-black text-store-charcoal">{d.name}</span>
                                        <span className="text-xs font-bold text-store-subtle uppercase tracking-widest">{d.duration_days} Hari - {d.price_formatted}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* TBD: Key management link */}
                                        <Link href={route('admin.products.keys.index', p.id)} className="text-[10px] font-black text-store-charcoal uppercase tracking-widest border-b-2 border-store-charcoal pb-0.5">
                                            Kelola Stok
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-6 text-center">
                        <div className="w-full aspect-square rounded-2xl bg-admin-bg border border-store-border flex items-center justify-center overflow-hidden mb-4">
                            {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-store-subtle flex flex-col items-center gap-2">
                                    <AppIcons.categories size={48} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-store-subtle uppercase tracking-widest">Total Stok Tersedia</span>
                            <div className="text-4xl font-black text-store-charcoal tracking-tighter">{p.keys_count}</div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-6">
                        <h3 className="font-black text-store-charcoal uppercase tracking-tighter text-sm">Form Inputs</h3>
                        <div className="space-y-3">
                            {p.fields.map(f => (
                                <div key={f.id} className="flex flex-col p-3 bg-admin-bg rounded-xl border border-store-border">
                                    <span className="text-[10px] font-black text-store-subtle uppercase tracking-widest">{f.name}</span>
                                    <span className="text-xs font-bold text-store-charcoal">{f.label} ({f.type})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
