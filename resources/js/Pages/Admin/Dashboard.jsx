import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/admin/StatCard';
import { AppIcons } from '@/Components/shared/AppIcon';

const STATUS_CONFIG = {
    success:  { label: 'Berhasil',    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    paid:     { label: 'Dibayar',     color: 'text-blue-600 bg-blue-50 border-blue-200' },
    unpaid:   { label: 'Belum Bayar', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    failed:   { label: 'Gagal',       color: 'text-red-600 bg-red-50 border-red-200' },
    canceled: { label: 'Dibatalkan',  color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

export default function AdminDashboard({ stats, recentOrders }) {
    return (
        <AdminLayout title="Dashboard" subtitle="Selamat datang kembali, Administrator">
            <Head title="Admin Dashboard" />

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Pendapatan"
                    value={`Rp ${new Intl.NumberFormat('id-ID').format(stats.revenue)}`}
                    sub="Total transaksi sukses"
                    trend="up"
                    accent="yellow"
                    icon="revenue"
                />
                <StatCard
                    label="Total Pesanan"
                    value={stats.total_orders.toLocaleString('id-ID')}
                    sub={`${stats.pending_orders} menunggu proses`}
                    trend={stats.pending_orders > 0 ? 'down' : 'neutral'}
                    accent="indigo"
                    icon="sales"
                    href={route('admin.orders.index')}
                />
                <StatCard
                    label="Pelanggan"
                    value={stats.total_members.toLocaleString('id-ID')}
                    sub="Member terdaftar"
                    trend="up"
                    accent="green"
                    icon="users"
                    href={route('admin.users.index')}
                />
                <StatCard
                    label="Tingkat Sukses"
                    value={`${stats.success_rate}%`}
                    sub="Rasio transaksi berhasil"
                    trend="neutral"
                    accent="gray"
                    icon="success"
                />
            </div>

            {/* ── Main Dashboard Content ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders Table (Col 1 & 2) */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="admin-content-card">
                        <div className="px-8 py-6 border-b border-store-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Transaksi Terbaru</h3>
                                <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-1">10 transaksi terakhir masuk</p>
                            </div>
                            <Link
                                href={route('admin.orders.index')}
                                className="flex items-center gap-1.5 px-4 py-2 bg-admin-bg rounded-lg text-xs font-bold text-store-charcoal hover:bg-store-border transition-all"
                            >
                                Semua Order <AppIcons.arrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="admin-table-container border-none rounded-none">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Invoice</th>
                                        <th>Produk</th>
                                        <th className="hidden lg:table-cell">Pelanggan</th>
                                        <th>Nominal</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-bold text-store-muted">{order.id}</span>
                                                    <span className="text-[10px] text-store-subtle">{order.created_at}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-black text-store-charcoal text-sm">{order.product}</span>
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-admin-bg flex items-center justify-center text-[10px] font-bold text-store-muted border border-store-border">
                                                        {(order.customer || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-store-charcoal truncate max-w-[120px]">{order.customer || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="font-black text-store-charcoal text-sm">{order.amount}</td>
                                            <td><StatusBadge status={order.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {recentOrders.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-soft">
                                    <AppIcons.orders className="w-6 h-6 text-store-subtle" />
                                </div>
                                <h4 className="text-base font-black text-store-charcoal uppercase tracking-tight">Belum Ada Transaksi</h4>
                                <p className="text-xs text-store-subtle uppercase font-bold tracking-widest mt-1">Data penjualan akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Widgets (Col 3) */}
                <div className="space-y-6">
                    {/* Quick Links */}
                    <div className="admin-content-card p-6 space-y-3">
                        <h4 className="text-[11px] font-black text-store-muted uppercase tracking-[0.2em] mb-4">Akses Cepat</h4>
                        {[
                            { label: 'Manajemen Produk',  icon: AppIcons.categories,  href: route('admin.products.index') },
                            { label: 'Daftar Pesanan',    icon: AppIcons.orders,       href: route('admin.orders.index') },
                            { label: 'Voucher & Promo',   icon: AppIcons.ticket,        href: route('admin.vouchers.index') },
                            { label: 'Pengguna',          icon: AppIcons.users,        href: route('admin.users.index') },
                            { label: 'Pengaturan Toko',   icon: AppIcons.settings,     href: route('admin.settings.index') },
                        ].map(({ label, icon: Icon, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-admin-bg hover:bg-store-border border border-store-border/50 hover:border-store-border transition-all group"
                            >
                                <Icon size={14} className="text-store-muted group-hover:text-store-charcoal transition-colors" />
                                <span className="text-xs font-bold text-store-charcoal">{label}</span>
                                <AppIcons.arrowRight size={12} className="ml-auto text-store-muted group-hover:text-store-charcoal transition-colors" />
                            </Link>
                        ))}
                    </div>

                    {/* Stock Alert */}
                    <div className={`admin-content-card p-6 space-y-3 ${stats.low_stock_keys < 10 ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                        <div className="flex items-center gap-2">
                            <AppIcons.key size={14} className={stats.low_stock_keys < 10 ? 'text-amber-500' : 'text-store-muted'} />
                            <h4 className="text-[11px] font-black text-store-muted uppercase tracking-[0.2em]">Stok Key Tersedia</h4>
                        </div>
                        <p className={`text-3xl font-black tracking-tighter ${stats.low_stock_keys < 10 ? 'text-amber-600' : 'text-store-charcoal'}`}>
                            {stats.low_stock_keys.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] font-bold text-store-subtle uppercase">
                            {stats.low_stock_keys < 10 ? '⚠ Stok hampir habis!' : 'Key siap terkirim'}
                        </p>
                        <Link href={route('admin.products.index')} className="block">
                            <button className="w-full py-2.5 bg-store-charcoal hover:bg-store-charcoal/80 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                                Kelola Stok Key
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
