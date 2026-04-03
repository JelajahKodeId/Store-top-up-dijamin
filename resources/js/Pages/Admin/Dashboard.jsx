import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/admin/StatCard';
import { OrderStatusBadge } from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function AdminDashboard({ stats, recentOrders }) {
    const SearchIcon = AppIcons.search;
    const FilterIcon = AppIcons.filter;
    const ArrowRightIcon = AppIcons.arrowRight;
    const EmptyIcon = AppIcons.orders;

    return (
        <AdminLayout title="Dashboard" subtitle="Selamat datang kembali, Administrator">
            <Head title="Admin Dashboard" />

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Pendapatan"
                    value={`Rp ${new Intl.NumberFormat('id-ID').format(stats.revenue)}`}
                    sub="Total keberhasilan"
                    trend="up"
                    accent="yellow"
                    icon="revenue"
                />
                <StatCard
                    label="Total Pesanan"
                    value={stats.total_orders.toLocaleString()}
                    sub="Semua status"
                    trend="up"
                    accent="indigo"
                    icon="sales"
                />
                <StatCard
                    label="Pelanggan"
                    value={stats.total_members.toLocaleString()}
                    sub="Member terdaftar"
                    trend="up"
                    accent="green"
                    icon="users"
                    href={route('admin.users.index')}
                />
                <StatCard
                    label="Tingkat Sukses"
                    value={`${stats.success_rate}%`}
                    sub="Rasio transaksi"
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
                                <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-1">Update otomatis setiap 30 detik</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg border border-store-border hover:bg-gray-50 transition-all text-store-muted hover:text-store-charcoal">
                                    <SearchIcon className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg border border-store-border hover:bg-gray-50 transition-all text-store-muted hover:text-store-charcoal">
                                    <FilterIcon className="w-4 h-4" />
                                </button>
                                <a href="#" className="ml-2 flex items-center gap-1.5 px-4 py-2 bg-admin-bg rounded-lg text-xs font-bold text-store-charcoal hover:bg-store-border transition-all">
                                    Semua Order <ArrowRightIcon className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        <div className="admin-table-container border-none rounded-none">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID TRX</th>
                                        <th>Game / Produk</th>
                                        <th className="hidden lg:table-cell">Pelanggan</th>
                                        <th>Nominal</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="font-mono text-xs font-bold text-store-muted">{order.id}</td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-store-charcoal text-sm">{order.product}</span>
                                                    <span className="text-[10px] text-store-muted uppercase font-bold tracking-wider">Top-up Langsung</span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-admin-bg flex items-center justify-center text-[10px] font-bold text-store-muted">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="font-black text-store-charcoal text-sm">{order.amount}</td>
                                            <td><OrderStatusBadge status={order.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {recentOrders.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-soft">
                                    <EmptyIcon className="w-6 h-6 text-store-subtle" />
                                </div>
                                <h4 className="text-base font-black text-store-charcoal uppercase tracking-tight">Belum Ada Transaksi</h4>
                                <p className="text-xs text-store-subtle uppercase font-bold tracking-widest mt-1">Data penjualan akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Sidebar Widgets (Col 3) */}
                <div className="space-y-8">
                    <div className="admin-content-card bg-store-charcoal border-none p-8 relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-store-accent rounded-full opacity-5 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10">
                            <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">Informasi Penting</h3>
                            <p className="text-store-subtle text-xs leading-relaxed mb-6 font-medium">
                                Pastikan saldo gateway pembayaran Anda mencukupi untuk memproses pesanan otomatis.
                            </p>
                            <button className="w-full py-3 bg-white hover:bg-store-accent text-store-charcoal font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lux">
                                Cek Saldo Gateway
                            </button>
                        </div>
                    </div>

                    <div className="admin-content-card p-6">
                        <h4 className="text-[11px] font-black text-store-muted uppercase tracking-[0.2em] mb-4">Aktivitas Sistem</h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-2 h-full min-h-[40px] bg-gray-100 rounded-full flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-store-charcoal leading-none">Sinkronisasi API Berhasil</p>
                                        <p className="text-[10px] text-store-subtle mt-1 uppercase font-bold">10 menit yang lalu</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
