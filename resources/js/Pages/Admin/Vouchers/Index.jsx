import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input, { Select } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function VoucherIndex({ vouchers, filters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        type: 'fixed',
        value: '',
        min_transaction: '',
        quota: '',
        expired_at: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (voucher) => {
        setSelectedVoucher(voucher);
        setData({
            code: voucher.code,
            type: voucher.type,
            value: voucher.value,
            min_transaction: voucher.min_transaction,
            quota: voucher.quota || '',
            expired_at: voucher.expired_at ? voucher.expired_at.split('T')[0] : '',
            is_active: voucher.is_active,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.vouchers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.vouchers.update', selectedVoucher.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (voucher) => {
        setSelectedVoucher(voucher);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.vouchers.destroy', selectedVoucher.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    const handleSearch = (val) => {
        router.get(route('admin.vouchers.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleFilter = (key, val) => {
        router.get(route('admin.vouchers.index'), { ...filters, [key]: val }, { preserveState: true });
    };

    return (
        <AdminLayout
            title="Manajemen Voucher"
            subtitle="Atur kode promo dan diskon untuk pelanggan"
        >
            <Head title="Manajemen Voucher" />

            <AdminTable
                title="Daftar Voucher"
                subtitle={`${vouchers.meta.total} Total Voucher`}
                onSearch={handleSearch}
                pagination={vouchers.meta}
                actions={
                    <>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => handleFilter('type', e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="fixed">Nominal (Rp)</option>
                            <option value="percent">Persentase (%)</option>
                        </select>

                        <Button
                            variant="dark"
                            size="md"
                            onClick={openCreateModal}
                            icon={AppIcons.plus}
                        >
                            Tambah Voucher
                        </Button>
                    </>
                }
                headers={[
                    { label: 'Kode & Tipe', className: 'w-[40%] sm:w-[25%]' },
                    { label: 'Potongan', className: 'w-[25%] sm:w-[15%]' },
                    { label: 'Min. Transaksi', className: 'hidden md:table-cell w-[15%]' },
                    { label: 'Kuota', className: 'w-[35%] sm:w-[15%]' },
                    { label: 'Expired', className: 'hidden lg:table-cell w-[15%]' },
                    { label: 'Aksi', className: 'w-[30%] sm:w-[15%] text-right' }
                ]}
            >
                {vouchers.data.map((voucher) => (
                    <tr key={voucher.id}>
                        <td>
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm">{voucher.code}</span>
                                <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{voucher.type === 'fixed' ? 'Potongan Harga' : 'Diskon Persen'}</span>
                            </div>
                        </td>
                        <td>
                            <span className="text-sm font-black text-green-600">
                                {voucher.type === 'fixed'
                                    ? `Rp ${new Intl.NumberFormat('id-ID').format(voucher.value)}`
                                    : `${voucher.value}%`}
                            </span>
                        </td>
                        <td className="hidden md:table-cell">
                            <span className="text-xs font-bold text-store-charcoal">
                                Rp {new Intl.NumberFormat('id-ID').format(voucher.min_transaction)}
                            </span>
                        </td>
                        <td>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-store-charcoal">{voucher.used} / {voucher.quota || '∞'}</span>
                                <div className="w-full bg-store-border h-1 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="bg-store-charcoal h-full transition-all"
                                        style={{ width: voucher.quota ? `${(voucher.used / voucher.quota) * 100}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        </td>
                        <td className="hidden lg:table-cell">
                            <span className="text-xs font-bold text-store-subtle">
                                {voucher.expired_at ? new Date(voucher.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak Ada'}
                            </span>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openEditModal(voucher)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.edit size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(voucher)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <AppIcons.delete size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Create Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tambah Voucher Baru"
                onSubmit={submitCreate}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitCreate} loading={processing}>Simpan Voucher</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Kode Voucher" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} error={errors.code} placeholder="PROMO123" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Select label="Tipe Diskon" value={data.type} onChange={e => setData('type', e.target.value)} error={errors.type}>
                            <option value="fixed">Nominal (Rp)</option>
                            <option value="percent">Persentase (%)</option>
                        </Select>
                        <Input label={data.type === 'fixed' ? 'Nominal Potongan (Rp)' : 'Besar Diskon (%)'} type="number" value={data.value} onChange={e => setData('value', e.target.value)} error={errors.value} placeholder={data.type === 'fixed' ? '5000' : '10'} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Input label="Minimal Transaksi (Rp)" type="number" value={data.min_transaction} onChange={e => setData('min_transaction', e.target.value)} error={errors.min_transaction} placeholder="20000" />
                        <Input label="Kuota (Opsional)" type="number" value={data.quota} onChange={e => setData('quota', e.target.value)} error={errors.quota} placeholder="100" />
                    </div>

                    <Input label="Tanggal Expired (Opsional)" type="date" value={data.expired_at} onChange={e => setData('expired_at', e.target.value)} error={errors.expired_at} />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Voucher Aktif</label>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Voucher"
                onSubmit={submitEdit}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitEdit} loading={processing}>Simpan Perubahan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Kode Voucher" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} error={errors.code} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Select label="Tipe Diskon" value={data.type} onChange={e => setData('type', e.target.value)} error={errors.type}>
                            <option value="fixed">Nominal (Rp)</option>
                            <option value="percent">Persentase (%)</option>
                        </Select>
                        <Input label={data.type === 'fixed' ? 'Nominal Potongan (Rp)' : 'Besar Diskon (%)'} type="number" value={data.value} onChange={e => setData('value', e.target.value)} error={errors.value} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Input label="Minimal Transaksi (Rp)" type="number" value={data.min_transaction} onChange={e => setData('min_transaction', e.target.value)} error={errors.min_transaction} />
                        <Input label="Kuota" type="number" value={data.quota} onChange={e => setData('quota', e.target.value)} error={errors.quota} />
                    </div>

                    <Input label="Tanggal Expired" type="date" value={data.expired_at} onChange={e => setData('expired_at', e.target.value)} error={errors.expired_at} />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="edit_is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="edit_is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Voucher Aktif</label>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Voucher"
                message={`Apakah Anda yakin ingin menghapus voucher "${selectedVoucher?.code}"? Akun promo ini tidak akan dapat diaktifkan kembali jika sudah dihapus.`}
            />
        </AdminLayout>
    );
}
