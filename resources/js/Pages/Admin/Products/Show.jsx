import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function ProductShow({ product }) {
    const p = product.data ?? product;

    return (
        <AdminLayout
            title="Detail Produk"
            subtitle={`Pantau stok key dan info ${p.name}`}
        >
            <Head title={`Detail — ${p.name}`} />

            {/* Back + Header Actions */}
            <div className="flex items-center justify-between mb-6">
                <Link href={route('admin.products.index')}>
                    <Button variant="ghost" size="sm" icon={AppIcons.back}>
                        Kembali ke Produk
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <Badge variant={p.status === 'active' ? 'accent' : 'gray'}>
                        {p.status === 'active' ? 'Aktif' : 'Draft'}
                    </Badge>
                    <Link href={route('admin.products.keys.index', p.id)}>
                        <Button variant="dark" size="sm" icon={AppIcons.key}>
                            Kelola Stok Key
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Kolom Kiri: Info Utama ─────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Info Card */}
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-6">
                        <div className="flex items-start gap-5">
                            {(p.image_url || p.image) ? (
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-store-border flex-shrink-0">
                                    <img src={p.image_url || p.image} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-admin-bg border border-store-border flex items-center justify-center flex-shrink-0">
                                    <AppIcons.categories size={28} className="text-store-subtle" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-black text-store-charcoal tracking-tighter truncate">{p.name}</h2>
                                <p className="text-store-subtle text-sm font-bold font-mono mt-0.5">/{p.slug}</p>
                            </div>
                        </div>

                        {p.description && (
                            <div className="pt-4 border-t border-store-border">
                                <p className="text-[10px] font-black text-store-subtle uppercase tracking-widest mb-2">Deskripsi</p>
                                <p className="text-sm text-store-charcoal font-medium leading-relaxed">{p.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Varian & Harga */}
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-5">
                        <h3 className="font-black text-store-charcoal uppercase tracking-tighter text-sm border-b border-store-border pb-4">
                            Pilihan Durasi & Harga
                        </h3>
                        {p.durations?.length > 0 ? (
                            <div className="space-y-3">
                                {p.durations.map((d) => {
                                    const stock = d.available_keys_count ?? 0;
                                    return (
                                        <div key={d.id} className="p-5 bg-admin-bg rounded-2xl border border-store-border flex items-center justify-between gap-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-black text-store-charcoal truncate">{d.name}</span>
                                                <span className="text-xs font-bold text-store-subtle uppercase tracking-widest mt-0.5">
                                                    {d.duration_days ? `${d.duration_days} Hari` : 'Tidak terbatas'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {/* Stok per durasi */}
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold text-store-subtle uppercase tracking-widest">Stok</p>
                                                    <p className={`text-sm font-black ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {stock > 0 ? `${stock} Key` : 'Habis'}
                                                    </p>
                                                </div>
                                                <span className="text-lg font-black text-store-charcoal">{formatPrice(d.price)}</span>
                                                <Badge variant={d.is_active ? 'accent' : 'gray'} className="text-[9px]">
                                                    {d.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-store-subtle italic">Belum ada varian.</p>
                        )}
                    </div>

                    {/* Custom Fields */}
                    {p.fields?.length > 0 && (
                        <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm space-y-5">
                            <h3 className="font-black text-store-charcoal uppercase tracking-tighter text-sm border-b border-store-border pb-4">
                                Form Input Pembeli
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {p.fields.map((f) => (
                                    <div key={f.id} className="flex flex-col p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-store-subtle uppercase tracking-widest">{f.name}</span>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="gray" className="text-[8px] py-0.5 px-2">{f.type}</Badge>
                                                {f.is_required && (
                                                    <Badge variant="accent" className="text-[8px] py-0.5 px-2">Wajib</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-store-charcoal">{f.label}</span>
                                        {f.placeholder && (
                                            <span className="text-[10px] text-store-muted italic mt-0.5">"{f.placeholder}"</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Kolom Kanan: Sidebar Stats ──────────────────────────── */}
                <div className="space-y-6">

                    {/* Stok Key Card */}
                    <div className="bg-white p-8 rounded-3xl border border-store-border shadow-sm text-center space-y-4">
                        <p className="text-[10px] font-black text-store-subtle uppercase tracking-widest">Total Stok Tersedia</p>
                        <div className="text-5xl font-black text-store-charcoal tracking-tighter">{p.keys_count ?? 0}</div>
                        <p className="text-[10px] font-bold text-store-muted uppercase">Key Siap Kirim</p>
                        <Link href={route('admin.products.keys.index', p.id)} className="block">
                            <Button variant="dark" size="sm" className="w-full" icon={AppIcons.key}>
                                Tambah / Kelola Key
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-white p-6 rounded-3xl border border-store-border shadow-sm space-y-4">
                        <h4 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest">Info Produk</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-store-subtle uppercase">Varian</span>
                                <span className="text-xs font-black text-store-charcoal">{p.durations?.length ?? 0} Durasi</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-store-subtle uppercase">Input Pembeli</span>
                                <span className="text-xs font-black text-store-charcoal">{p.fields?.length ?? 0} Fields</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-store-subtle uppercase">Dibuat</span>
                                <span className="text-xs font-black text-store-charcoal">{p.created_at}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Hint */}
                    <div className="p-5 rounded-2xl bg-store-accent/5 border border-store-accent/20 flex items-start gap-3">
                        <AppIcons.info size={16} className="text-store-accent flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-store-subtle uppercase tracking-tight leading-relaxed">
                            Untuk mengedit produk, kembali ke daftar produk dan gunakan tombol <span className="text-store-charcoal">Edit</span>.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
