import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function ProductShow({ product }) {
    const p = product.data ?? product;
    const reviews = p.reviews ?? [];

    return (
        <AdminLayout
            title="Detail Produk"
            subtitle={`Pantau stok key dan info ${p.name}`}
        >
            <Head title={`Detail — ${p.name}`} />

            {/* Back + Header Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={route('admin.products.index')} className="w-full sm:w-auto">
                    <Button variant="ghost" size="sm" icon={AppIcons.back} className="w-full sm:w-auto">
                        Kembali ke Produk
                    </Button>
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant={p.status === 'active' ? 'accent' : 'gray'}>
                        {p.status === 'active' ? 'Aktif' : 'Draft'}
                    </Badge>
                    <Link href={route('admin.products.keys.index', p.id)} className="min-w-0 flex-1 sm:flex-initial">
                        <Button variant="dark" size="sm" icon={AppIcons.key} className="w-full sm:w-auto">
                            Kelola Stok Key
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Kolom Kiri: Info Utama ─────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Info Card */}
                    <div className="space-y-6 rounded-3xl border border-store-border bg-white p-5 shadow-sm sm:p-8">
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
                        {p.telegram_group_invite_url && (
                            <div className="pt-4 border-t border-store-border">
                                <p className="text-[10px] font-black text-store-subtle uppercase tracking-widest mb-2">Telegram grup</p>
                                <a
                                    href={p.telegram_group_invite_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-sky-600 break-all underline hover:text-sky-800"
                                >
                                    {p.telegram_group_invite_url}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Ulasan pelanggan */}
                    <div className="space-y-5 rounded-3xl border border-store-border bg-white p-5 shadow-sm sm:p-8">
                        <h3 className="border-b border-store-border pb-4 font-black text-sm uppercase tracking-tighter text-store-charcoal">
                            Ulasan & rating ({reviews.length})
                        </h3>
                        {reviews.length === 0 ? (
                            <p className="text-sm text-store-subtle italic">Belum ada ulasan.</p>
                        ) : (
                            <ul className="space-y-3">
                                {reviews.map((r) => (
                                    <li key={r.id} className="rounded-2xl border border-store-border bg-admin-bg p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-black text-store-charcoal">{r.author_name}</span>
                                                <span className="inline-flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <AppIcons.star
                                                            key={i}
                                                            size={14}
                                                            strokeWidth={2}
                                                            className={i <= r.rating ? 'fill-amber-400 text-amber-500' : 'fill-none text-zinc-300'}
                                                        />
                                                    ))}
                                                </span>
                                                {r.verified_purchase && (
                                                    <Badge variant="accent" className="text-[8px]">Terverifikasi</Badge>
                                                )}
                                                <Badge variant={r.is_published ? 'charcoal' : 'gray'} className="text-[8px]">
                                                    {r.is_published ? 'Publik' : 'Menunggu'}
                                                </Badge>
                                            </div>
                                            <span className="text-[9px] font-bold text-store-subtle">{r.created_at}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-store-charcoal leading-relaxed">{r.body}</p>
                                        {r.invoice_code && (
                                            <p className="mt-1 text-[9px] font-mono text-store-subtle">Invoice: {r.invoice_code}</p>
                                        )}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {!r.is_published ? (
                                                <Button
                                                    type="button"
                                                    variant="dark"
                                                    size="sm"
                                                    onClick={() => router.patch(route('admin.products.reviews.publish', { product: p.id, review: r.id }))}
                                                >
                                                    Terbitkan
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => router.patch(route('admin.products.reviews.unpublish', { product: p.id, review: r.id }))}
                                                >
                                                    Sembunyikan
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="!text-red-600"
                                                onClick={() => {
                                                    if (confirm('Hapus ulasan ini?')) {
                                                        router.delete(route('admin.products.reviews.destroy', { product: p.id, review: r.id }));
                                                    }
                                                }}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Varian & Harga */}
                    <div className="space-y-5 rounded-3xl border border-store-border bg-white p-5 shadow-sm sm:p-8">
                        <h3 className="border-b border-store-border pb-4 font-black text-sm uppercase tracking-tighter text-store-charcoal">
                            Pilihan Durasi & Harga
                        </h3>
                        {p.durations?.length > 0 ? (
                            <div className="space-y-3">
                                {p.durations.map((d) => {
                                    const stock = d.available_keys_count ?? 0;
                                    return (
                                        <div key={d.id} className="flex flex-col gap-4 rounded-2xl border border-store-border bg-admin-bg p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                            <div className="min-w-0 flex flex-col">
                                                <span className="truncate font-black text-store-charcoal">{d.name}</span>
                                                <span className="mt-0.5 text-xs font-bold uppercase tracking-widest text-store-subtle">
                                                    {d.duration_days ? `${d.duration_days} Hari` : 'Tidak terbatas'}
                                                </span>
                                            </div>
                                            <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:gap-3">
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
                        <div className="space-y-5 rounded-3xl border border-store-border bg-white p-5 shadow-sm sm:p-8">
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
                    <div className="space-y-4 rounded-3xl border border-store-border bg-white p-6 text-center shadow-sm sm:p-8">
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
                    <div className="space-y-4 rounded-3xl border border-store-border bg-white p-5 shadow-sm sm:p-6">
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
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-store-subtle uppercase">Telegram</span>
                                <span className="text-xs font-black text-store-charcoal">{p.telegram_group_invite_url ? 'Ya' : '—'}</span>
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
