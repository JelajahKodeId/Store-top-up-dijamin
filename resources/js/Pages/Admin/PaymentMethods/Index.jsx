import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function PaymentMethodIndex({ paymentMethods, filters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        fee_flat: '0',
        fee_percent: '0',
        image_url: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (method) => {
        setSelectedMethod(method);
        setData({
            name: method.name,
            code: method.code,
            fee_flat: method.fee_flat.toString(),
            fee_percent: method.fee_percent.toString(),
            image_url: method.image_url.includes('ui-avatars') ? '' : method.image_url,
            is_active: method.is_active,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.payment-methods.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.payment-methods.update', selectedMethod.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (method) => {
        setSelectedMethod(method);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.payment-methods.destroy', selectedMethod.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    const handleSearch = (val) => {
        router.get(route('admin.payment-methods.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const PlusIcon = AppIcons.plus;
    const EditIcon = AppIcons.edit;
    const TrashIcon = AppIcons.delete;
    const WalletIcon = AppIcons.payments;

    return (
        <AdminLayout
            title="Metode Pembayaran"
            subtitle="Atur gateway pembayaran dan biaya admin transaksi"
        >
            <Head title="Manajemen Pembayaran" />

            <AdminTable
                title="Daftar Gateway"
                subtitle={`${paymentMethods.meta.total} Total Metode Tersedia`}
                onSearch={handleSearch}
                pagination={paymentMethods.meta}
                actions={
                    <Button
                        variant="dark"
                        size="md"
                        onClick={openCreateModal}
                        icon={PlusIcon}
                    >
                        Tambah Metode
                    </Button>
                }
                headers={[
                    { label: 'Metode', className: 'w-[35%]' },
                    { label: 'Biaya (Fee)', className: 'w-[25%]' },
                    { label: 'Status', className: 'w-[20%]' },
                    { label: 'Aksi', className: 'w-[20%] text-right' }
                ]}
            >
                {paymentMethods.data.map((method) => (
                    <tr key={method.id}>
                        <td>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-admin-bg border border-store-border p-2 flex items-center justify-center overflow-hidden">
                                    <img src={method.image_url} alt={method.name} className="max-h-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-store-charcoal text-sm">{method.name}</span>
                                    <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{method.code}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-store-charcoal">Rp {method.fee_flat.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-store-accent">+{method.fee_percent}%</span>
                            </div>
                        </td>
                        <td>
                            <Badge variant={method.is_active ? 'accent' : 'gray'}>
                                {method.is_active ? 'Aktif' : 'Non-aktif'}
                            </Badge>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={route('admin.payment-methods.show', method.id)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.view size={16} />
                                </Link>
                                <button
                                    onClick={() => openEditModal(method)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <EditIcon size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(method)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Metode Pembayaran">
                <form onSubmit={submitCreate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Metode" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="BCA Virtual Account" icon="payments" />
                        <Input label="Kode Gateway" value={data.code} onChange={e => setData('code', e.target.value)} error={errors.code} placeholder="BCAVA" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Biaya Flat (Rp)" type="number" value={data.fee_flat} onChange={e => setData('fee_flat', e.target.value)} error={errors.fee_flat} />
                        <Input label="Biaya Persen (%)" type="number" value={data.fee_percent} onChange={e => setData('fee_percent', e.target.value)} error={errors.fee_percent} />
                    </div>

                    <Input label="URL Logo" value={data.image_url} onChange={e => setData('image_url', e.target.value)} error={errors.image_url} placeholder="https://..." icon="banners" />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                        <label htmlFor="is_active" className="text-xs font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Metode Aktif & Digunakan</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" loading={processing}>Simpan Metode</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Metode Pembayaran">
                <form onSubmit={submitEdit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nama Metode" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} icon="payments" />
                        <Input label="Kode Gateway" value={data.code} onChange={e => setData('code', e.target.value)} error={errors.code} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Biaya Flat (Rp)" type="number" value={data.fee_flat} onChange={e => setData('fee_flat', e.target.value)} error={errors.fee_flat} />
                        <Input label="Biaya Persen (%)" type="number" value={data.fee_percent} onChange={e => setData('fee_percent', e.target.value)} error={errors.fee_percent} />
                    </div>

                    <Input label="URL Logo" value={data.image_url} onChange={e => setData('image_url', e.target.value)} error={errors.image_url} icon="banners" />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="edit_is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                        <label htmlFor="edit_is_active" className="text-xs font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Metode Aktif & Digunakan</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" loading={processing}>Simpan Perubahan</Button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Metode Pembayaran"
                message={`Apakah Anda yakin ingin menghapus metode pembayaran "${selectedMethod?.name}"? Transaksi yang sudah ada mungkin tidak akan terpengaruh, namun metode ini tidak akan tersedia lagi.`}
            />
        </AdminLayout>
    );
}
