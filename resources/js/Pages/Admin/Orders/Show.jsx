import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { OrderStatusBadge } from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function OrderShow({ order }) {
    // order is wrapped in 'data' by JsonResource if sent as new OrderResource($order)
    const o = order.data || order;

    const { data, setData, put, processing } = useForm({
        status: o.status,
        note: o.note || '',
    });

    const submitStatus = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', o.id));
    };

    const BackIcon = AppIcons.chevronLeft;
    const KeyIcon  = AppIcons.key;

    return (
        <AdminLayout
            title="Detail Pesanan"
            subtitle={`Informasi Lengkap Transaksi: ${o.invoice_code}`}
        >
            <Head title={`Order Detail - ${o.invoice_code}`} />

            <div className="mb-8 flex items-center justify-between">
                <Link
                    href={route('admin.orders.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Daftar Pesanan
                </Link>

                <OrderStatusBadge status={o.status} className="px-6 py-2 text-[10px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items Grid */}
                    <div className="admin-content-card">
                        <div className="px-8 py-6 border-b border-store-border flex items-center justify-between bg-admin-bg/50">
                            <h3 className="text-sm font-black text-store-charcoal uppercase tracking-widest">Produk dalam Pesanan</h3>
                            <span className="text-[10px] font-bold text-store-subtle uppercase tracking-[0.2em]">{o.created_at}</span>
                        </div>

                        <div className="p-8 space-y-6">
                            {o.items.map((item) => (
                                <div key={item.id} className="p-6 bg-admin-bg rounded-2xl border border-store-border space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-store-border shadow-sm">
                                                <AppIcons.categories size={18} className="text-store-muted" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-store-charcoal">{item.product_name}</span>
                                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-tight">{item.duration_name}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-store-charcoal">{item.price_formatted}</span>
                                    </div>

                                    {/* Digital Keys */}
                                    {item.keys && item.keys.length > 0 && (
                                        <div className="pt-4 border-t border-store-border border-dashed">
                                            <span className="text-[10px] font-black text-store-subtle uppercase tracking-widest block mb-3">Lisensi / Key Digital</span>
                                            <div className="space-y-2">
                                                {item.keys.map((key, idx) => (
                                                    <div key={idx} className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-store-border">
                                                        <div className="flex items-center gap-3">
                                                            <KeyIcon size={14} className="text-store-accent flex-shrink-0" />
                                                            <code className="text-xs font-bold text-store-charcoal font-mono flex-1 break-all">{key.key_code}</code>
                                                        </div>
                                                        {key.expired_at && (
                                                            <p className="text-[10px] text-store-subtle font-bold ml-6">
                                                                Expired: {key.expired_at}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="px-8 py-6 bg-admin-bg border-t border-store-border flex items-center justify-between">
                            <span className="text-sm font-black text-store-charcoal uppercase tracking-tight">Total Pembayaran</span>
                            <span className="text-xl font-black text-store-accent">{o.total_price_formatted}</span>
                        </div>
                    </div>

                    {/* Customer & Field Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Field Values */}
                        <div className="admin-content-card p-8">
                            <h3 className="text-xs font-black text-store-charcoal uppercase tracking-widest mb-6 border-b border-store-border pb-4">Data Tujuan (ID/Account)</h3>
                            <div className="space-y-4">
                                {o.field_values.length > 0 ? o.field_values.map((fv) => (
                                    <div key={fv.id} className="flex flex-col">
                                        <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider mb-1">{fv.field_name}</span>
                                        <span className="text-sm font-black text-store-charcoal">{fv.field_value}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-store-subtle italic">Tidak ada data tambahan.</p>
                                )}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="admin-content-card p-8">
                            <h3 className="text-xs font-black text-store-charcoal uppercase tracking-widest mb-6 border-b border-store-border pb-4">Informasi Pembeli</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-store-muted">
                                        <AppIcons.users size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-store-subtle uppercase tracking-tight">Nama</span>
                                        <span className="text-xs font-black text-store-charcoal">{o.customer_name || 'Guest'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-store-muted">
                                        <AppIcons.mail size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-store-subtle uppercase tracking-tight">Email</span>
                                        <span className="text-xs font-black text-store-charcoal">{o.customer_email}</span>
                                    </div>
                                </div>
                                {o.customer_phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-store-muted">
                                            <AppIcons.phone size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-store-subtle uppercase tracking-tight">WhatsApp / HP</span>
                                            <span className="text-xs font-black text-store-charcoal">{o.customer_phone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Status Management */}
                    <div className="admin-content-card p-8 bg-store-charcoal text-white shadow-xl shadow-store-accent/5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-store-muted mb-6">Update Status</h3>
                        <form onSubmit={submitStatus} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-store-muted uppercase tracking-widest">Status Pesanan</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full bg-store-charcoal-light border border-store-border-dark rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-store-accent transition-all cursor-pointer"
                                >
                                    <option value="unpaid">Belum Bayar (Unpaid)</option>
                                    <option value="paid">Dibayar (Paid)</option>
                                    <option value="success">Berhasil (Success)</option>
                                    <option value="failed">Gagal (Failed)</option>
                                    <option value="canceled">Dibatalkan (Canceled)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-store-muted uppercase tracking-widest">Catatan (Optional)</label>
                                <textarea
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    className="w-full bg-store-charcoal-light border border-store-border-dark rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-store-accent transition-all min-h-[100px] resize-none"
                                    placeholder="Alasan pembatalan atau catatan sukses..."
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="accent"
                                className="w-full py-4 text-[10px] tracking-[0.2em] font-black uppercase"
                                loading={processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </form>
                    </div>

                    {/* Payment Info Card */}
                    <div className="admin-content-card p-8 space-y-4">
                        <h3 className="text-xs font-black text-store-charcoal uppercase tracking-widest">Info Pembayaran</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-admin-bg rounded-2xl border border-store-border flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold text-store-subtle uppercase tracking-tight">Metode</span>
                                    <span className="text-xs font-black text-store-charcoal">{o.payment_method || 'Manual'}</span>
                                </div>
                                <AppIcons.success size={16} className="text-store-muted" />
                            </div>
                            {o.whatsapp_number && (
                                <div className="p-4 bg-admin-bg rounded-2xl border border-store-border">
                                    <span className="text-[9px] font-bold text-store-subtle uppercase tracking-tight block">WhatsApp</span>
                                    <span className="text-xs font-black text-store-charcoal">{o.whatsapp_number}</span>
                                </div>
                            )}
                            {o.discount_amount > 0 && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight block">Diskon Diterapkan</span>
                                    <span className="text-xs font-black text-emerald-700">
                                        Rp {new Intl.NumberFormat('id-ID').format(o.discount_amount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
