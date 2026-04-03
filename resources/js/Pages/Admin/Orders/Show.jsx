import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function OrderShow({ order }) {
    const { data, setData, put, processing } = useForm({
        status: order.status,
        note: order.note || '',
    });

    const submitStatus = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', order.id));
    };

    const BackIcon = AppIcons.chevronLeft;
    const CheckIcon = AppIcons.plus; // Placeholder for check

    const getStatusVariant = (status) => {
        switch (status) {
            case 'success': return 'accent';
            case 'paid': return 'indigo';
            case 'unpaid': return 'gray';
            case 'failed': return 'red';
            case 'canceled': return 'slate';
            default: return 'gray';
        }
    };

    return (
        <AdminLayout
            title="Detail Pesanan"
            subtitle={`Informasi Lengkap Transaksi: ${order.trx_id}`}
        >
            <Head title={`Order Detail - ${order.trx_id}`} />

            <div className="mb-8 flex items-center justify-between">
                <Link
                    href={route('admin.orders.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Daftar Pesanan
                </Link>

                <Badge variant={getStatusVariant(order.status)} className="px-6 py-2 text-[10px] uppercase">
                    {order.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Details Card */}
                    <div className="admin-content-card">
                        <div className="px-8 py-6 border-b border-store-border flex items-center justify-between">
                            <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Rincian Transaksi</h3>
                            <span className="text-[10px] font-bold text-store-subtle uppercase tracking-[0.2em]">{order.created_at}</span>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-2">Produk / Paket</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-admin-bg flex items-center justify-center border border-store-border">
                                            <AppIcons.categories size={18} className="text-store-muted" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-store-charcoal">{order.product?.name || 'Produk Dihapus'}</span>
                                            <span className="text-[10px] font-bold text-store-subtle uppercase tracking-tight">{order.product?.sku || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-2">Target Pelanggan</span>
                                    <div className="p-3 bg-admin-bg rounded-xl border border-store-border flex items-center justify-between">
                                        <span className="text-sm font-black text-store-charcoal">{order.target_id}</span>
                                        {order.zone_id && <Badge variant="gray" className="text-[9px]">{order.zone_id}</Badge>}
                                    </div>
                                </div>
                            </div>

                            {Object.keys(order.extra_data || {}).length > 0 && (
                                <div className="mt-6 pt-6 border-t border-store-border border-dashed">
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-4">Informasi Detail (Extra Data)</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(order.extra_data).map(([key, value]) => (
                                            <div key={key} className="flex flex-col p-3 bg-admin-bg rounded-xl border border-store-border">
                                                <span className="text-[8px] font-black text-store-subtle uppercase tracking-widest mb-1">{key.replace('_', ' ')}</span>
                                                <span className="text-xs font-black text-store-charcoal truncate">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <hr className="border-store-border border-dashed" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-2">Metode Pembayaran</span>
                                    <div className="flex items-center gap-3">
                                        {order.payment_method?.image_url && (
                                            <img src={order.payment_method.image_url} alt="" className="h-6 object-contain" />
                                        )}
                                        <span className="text-sm font-black text-store-charcoal">{order.payment_method?.name || 'Manual'}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-2">Referensi Gateway</span>
                                    <span className="text-sm font-black text-store-muted font-mono">{order.reference || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-admin-bg border-t border-store-border flex items-center justify-between">
                            <span className="text-sm font-black text-store-charcoal uppercase tracking-tight">Total Pembayaran</span>
                            <span className="text-xl font-black text-store-accent">{order.total_price_formatted}</span>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="admin-content-card p-8">
                        <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight mb-6">Informasi Pelanggan</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-store-muted">
                                    <AppIcons.users size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider">Nama</span>
                                    <span className="text-sm font-black text-store-charcoal">{order.customer_name || 'Guest'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-store-muted">
                                    <AppIcons.mail size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider">Email Notifikasi</span>
                                    <span className="text-sm font-black text-store-charcoal">{order.customer_email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Status Management */}
                    <div className="admin-content-card p-8 bg-store-charcoal text-white">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-store-muted mb-6">Kelola Status</h3>
                        <form onSubmit={submitStatus} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-store-muted uppercase tracking-widest">Update Status Manual</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-store-charcoal-light border border-store-border-dark rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-store-accent transition-all"
                                >
                                    <option value="unpaid">Belum Bayar (Unpaid)</option>
                                    <option value="paid">Dibayar (Paid)</option>
                                    <option value="success">Berhasil (Success)</option>
                                    <option value="failed">Gagal (Failed)</option>
                                    <option value="canceled">Dibatalkan (Canceled)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-store-muted uppercase tracking-widest">Catatan Admin</label>
                                <textarea
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    className="w-full bg-store-charcoal-light border border-store-border-dark rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-store-accent transition-all min-h-[100px]"
                                    placeholder="Alasan pembatalan, bukti sukses, dll..."
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="accent"
                                className="w-full py-4 text-xs tracking-widest font-black"
                                loading={processing}
                            >
                                UPDATE STATUS PESANAN
                            </Button>
                        </form>
                    </div>

                    {/* Note Card */}
                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-soft text-indigo-600 shrink-0">
                                <AppIcons.info size={20} />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-indigo-900 uppercase tracking-tight mb-1">Informasi Gateway</h5>
                                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                                    Status 'Success' akan tercatat secara otomatis jika integrasi Payment Gateway aktif. Gunakan update manual hanya untuk keperluan darurat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
