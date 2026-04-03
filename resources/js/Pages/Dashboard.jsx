import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatCard from '@/Components/admin/StatCard';
import { OrderStatusBadge } from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Dashboard() {
    const { auth } = usePage().props;
    const ShoppingCartIcon = AppIcons.orders;

    return (
        <AuthenticatedLayout
            header={
                <div className="py-2">
                    <p className="text-[11px] font-bold text-store-subtle uppercase tracking-[0.2em] mb-1">Dashboard Pelanggan</p>
                    <h2 className="text-2xl font-black text-store-charcoal tracking-tight uppercase">Halo, {auth.user.name} 👋</h2>
                </div>
            }
        >
            <Head title="Dashboard Saya" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <StatCard
                    label="Saldo Anda"
                    value="Rp 0"
                    sub="Top-up saldo sekarang"
                    accent="yellow"
                    icon="wallet"
                />
                <StatCard
                    label="Total Pesanan"
                    value="0"
                    sub="Mulai belanja"
                    accent="indigo"
                    icon="sales"
                />
                <StatCard
                    label="Transaksi Sukses"
                    value="0"
                    sub="Riwayat transaksi"
                    accent="green"
                    icon="success"
                />
            </div>

            {/* Recent activity card */}
            <div className="admin-content-card">
                <div className="px-8 py-6 border-b border-store-border">
                    <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Riwayat Transaksi</h3>
                    <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-1">Status pesanan real-time</p>
                </div>

                <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-admin-bg rounded-3xl flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-soft">
                        <ShoppingCartIcon className="w-8 h-8 text-store-subtle" />
                    </div>
                    <h4 className="text-lg font-black text-store-charcoal uppercase tracking-tight mb-2">Belum Ada Transaksi</h4>
                    <p className="text-sm text-store-muted mb-8 max-w-xs mx-auto font-medium">
                        Sepertinya Anda belum melakukan pemesanan. Jelajahi katalog kami dan temukan penawaran terbaik!
                    </p>
                    <a href="/" className="inline-flex items-center justify-center px-8 py-4 bg-store-accent hover:bg-store-accent-dark text-store-charcoal font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lux">
                        Mulai Belanja Sekarang
                    </a>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
