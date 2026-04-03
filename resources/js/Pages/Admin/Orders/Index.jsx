import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';
import { Link } from '@inertiajs/react';

export default function OrderIndex({ orders, filters }) {
    const handleSearch = (val) => {
        router.get(route('admin.orders.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (status) => {
        router.get(route('admin.orders.index'), { ...filters, status: status }, { preserveState: true });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'accent';
            case 'paid': return 'indigo';
            case 'unpaid': return 'gray';
            case 'failed': return 'red';
            case 'canceled': return 'slate';
            default: return 'gray';
        }
    };

    const EyeIcon = AppIcons.view;
    const UserIcon = AppIcons.users;
    const CartIcon = AppIcons.orders;

    return (
        <AdminLayout
            title="Manajemen Pesanan"
            subtitle="Pantau dan kelola seluruh transaksi pelanggan"
        >
            <Head title="Manajemen Pesanan" />

            <AdminTable
                title="Daftar Transaksi"
                subtitle={`${orders.meta.total} Total Pesanan`}
                onSearch={handleSearch}
                pagination={orders.meta}
                actions={
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                    >
                        <option value="">Semua Status</option>
                        <option value="unpaid">Belum Bayar</option>
                        <option value="paid">Dibayar</option>
                        <option value="success">Berhasil</option>
                        <option value="failed">Gagal</option>
                        <option value="canceled">Dibatalkan</option>
                    </select>
                }
                headers={[
                    { label: 'Transaksi', className: 'w-[30%]' },
                    { label: 'Pelanggan', className: 'w-[25%]' },
                    { label: 'Total', className: 'w-[20%]' },
                    { label: 'Status', className: 'w-[15%]' },
                    { label: 'Aksi', className: 'w-[10%] text-right' }
                ]}
            >
                {orders.data.map((order) => (
                    <tr key={order.id}>
                        <td>
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm">{order.trx_id}</span>
                                <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{order.created_at}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-admin-bg flex items-center justify-center text-store-muted border border-store-border flex-shrink-0">
                                    <UserIcon size={14} />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="font-bold text-store-charcoal text-xs truncate">{order.customer_name || 'Guest'}</span>
                                    <span className="text-[10px] text-store-subtle font-medium truncate">{order.customer_email}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span className="font-black text-store-charcoal text-sm">{order.total_price_formatted}</span>
                        </td>
                        <td>
                            <Badge variant={getStatusColor(order.status)} className="uppercase text-[9px] tracking-widest px-3">
                                {order.status}
                            </Badge>
                        </td>
                        <td className="text-right">
                            <Link
                                href={route('admin.orders.show', order.id)}
                                className="p-2 inline-flex rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                            >
                                <EyeIcon size={16} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminTable>
        </AdminLayout>
    );
}
