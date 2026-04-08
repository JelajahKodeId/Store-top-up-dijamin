import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import { OrderStatusBadge } from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import { Select } from '@/Components/ui/Input';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function OrderIndex({ orders, filters }) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data, setData, put, processing, reset } = useForm({
        status: '',
    });

    const handleSearch = (val) => {
        router.get(route('admin.orders.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleFilter = (key, val) => {
        router.get(route('admin.orders.index'), { ...filters, [key]: val }, { preserveState: true });
    };

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        setData('status', order.status);
        setIsStatusModalOpen(true);
    };

    const updateStatus = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', selectedOrder.id), {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AdminLayout
            title="Daftar Pesanan"
            subtitle="Kelola dan pantau transaksi pelanggan"
        >
            <Head title="Manajemen Pesanan" />

            <AdminTable
                title="Semua Transaksi"
                subtitle={`${orders.meta.total} Total Transaksi`}
                onSearch={handleSearch}
                pagination={orders.meta}
                actions={
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
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
                    { label: 'Invoice', className: 'w-[30%] sm:w-[20%]' },
                    { label: 'Pelanggan', className: 'hidden md:table-cell w-[25%]' },
                    { label: 'Total', className: 'w-[20%] sm:w-[15%]' },
                    { label: 'Status', className: 'w-[20%] sm:w-[15%]' },
                    { label: 'Aksi', className: 'w-[30%] sm:w-[25%] text-right' }
                ]}
            >
                {orders.data.map((order) => (
                    <tr key={order.id}>
                        <td>
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm">{order.invoice_code}</span>
                                <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{order.created_at}</span>
                                {order.payment_method_display && (
                                    <span className="text-[9px] text-store-muted font-bold mt-0.5 truncate max-w-[200px]" title={order.payment_method_display}>
                                        {order.payment_record?.gateway ? `${order.payment_record.gateway} · ` : ''}{order.payment_method_display}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="hidden md:table-cell">
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm truncate">{order.customer_name || 'Guest'}</span>
                                <span className="text-[10px] text-store-subtle font-bold truncate">{order.customer_email}</span>
                            </div>
                        </td>
                        <td>
                            <span className="text-sm font-black text-store-charcoal">{order.total_price_formatted}</span>
                        </td>
                        <td>
                            <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openStatusModal(order)}
                                    className="px-3 py-1.5 rounded-lg bg-store-accent/10 text-store-accent hover:bg-store-accent hover:text-white text-[10px] font-black uppercase tracking-tight transition-all"
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => router.get(route('admin.orders.show', order.id))}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.view size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Quick Status Update Modal */}
            <Modal
                show={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title="Update Status Pesanan"
                onSubmit={updateStatus}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" type="button" onClick={() => setIsStatusModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={updateStatus} loading={processing}>Simpan Status</Button>
                    </div>
                }
            >
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-5 bg-admin-bg rounded-2xl border border-store-border flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-store-subtle uppercase tracking-widest leading-none font-sans">Invoice</span>
                            <span className="text-sm font-black text-store-charcoal leading-tight font-sans">{selectedOrder?.invoice_code}</span>
                        </div>
                        <OrderStatusBadge status={selectedOrder?.status} />
                    </div>

                    <Select
                        label="Pilih Status Baru"
                        value={data.status}
                        onChange={e => setData('status', e.target.value)}
                    >
                        <option value="unpaid">Belum Bayar (Unpaid)</option>
                        <option value="paid">Dibayar (Paid)</option>
                        <option value="success">Berhasil (Success)</option>
                        <option value="failed">Gagal (Failed)</option>
                        <option value="canceled">Dibatalkan (Canceled)</option>
                    </Select>
                </div>
            </Modal>
        </AdminLayout>
    );
}
