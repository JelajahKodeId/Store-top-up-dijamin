import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function MemberTierIndex({ tiers }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        level: 1,
        price: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setData('level', tiers.length > 0 ? Math.max(...tiers.map(t => t.level)) + 1 : 1);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (tier) => {
        setSelectedTier(tier);
        setData({
            name: tier.name,
            level: tier.level,
            price: tier.price || '',
            is_active: tier.is_active,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.member-tiers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.member-tiers.update', selectedTier.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (tier) => {
        setSelectedTier(tier);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.member-tiers.destroy', selectedTier.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    return (
        <AdminLayout
            title="Paket Member"
            subtitle="Atur paket keanggotaan dan harga upgrade"
        >
            <Head title="Manajemen Paket Member" />

            <div className="mb-8 flex justify-end">
                <Button variant="dark" onClick={openCreateModal} icon={AppIcons.plus}>Tambah Paket</Button>
            </div>

            <div className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="bg-admin-bg/50 border-b border-store-border">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-store-subtle uppercase tracking-widest whitespace-nowrap">Level (Rank)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-store-subtle uppercase tracking-widest whitespace-nowrap">Nama Paket</th>
                                <th className="px-6 py-4 text-[10px] font-black text-store-subtle uppercase tracking-widest whitespace-nowrap">Harga Tetap (Rp)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-store-subtle uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-store-subtle uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-store-border/50">
                            {tiers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-sm font-bold text-store-muted">Belum ada paket member.</td>
                                </tr>
                            ) : tiers.map((tier) => (
                                <tr key={tier.id} className="hover:bg-store-surface transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="inline-flex w-8 h-8 items-center justify-center bg-admin-bg rounded-lg border border-store-border text-sm font-black text-store-charcoal">
                                            {tier.level}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-store-charcoal">{tier.name}</p>
                                        <p className="text-[10px] text-store-muted font-bold font-mono mt-0.5">{tier.id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tier.price === null || tier.price === '' ? (
                                            <span className="text-store-muted text-xs font-bold italic">Gratis / Default</span>
                                        ) : (
                                            <span className="font-mono text-sm font-black text-store-accent-dark">
                                                Rp {new Intl.NumberFormat('id-ID').format(tier.price)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant={tier.is_active ? 'accent' : 'gray'}>
                                            {tier.is_active ? 'Aktif' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(tier)}
                                                className="p-2 rounded-lg bg-white border border-store-border text-store-muted hover:text-store-charcoal hover:bg-admin-bg transition-all"
                                                title="Edit paket"
                                            >
                                                <AppIcons.edit size={16} />
                                            </button>
                                            {tier.level !== 0 && (
                                                <button
                                                    onClick={() => openDeleteModal(tier)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
                                                    title="Hapus paket"
                                                >
                                                    <AppIcons.delete size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tambah Paket Baru"
                onSubmit={submitCreate}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitCreate} loading={processing}>Simpan Paket</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Paket" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: Reseller Plus" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Level / Rank (Angka)" 
                            type="number"
                            value={data.level} 
                            onChange={e => setData('level', e.target.value)} 
                            error={errors.level} 
                            placeholder="Contoh: 1" 
                            helper="Angka level yang lebih tinggi berarti posisi yang lebih premium di atas paket lainnya."
                        />
                        <Input 
                            label="Harga Upgrade (Rp)" 
                            type="number"
                            value={data.price} 
                            onChange={e => setData('price', e.target.value)} 
                            error={errors.price} 
                            placeholder="Contoh: 50000" 
                            helper="Kosongkan jika paket ini instan (gratis)."
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Tersedia Untuk Dibeli</label>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Paket Member"
                onSubmit={submitEdit}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitEdit} loading={processing}>Simpan Perubahan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Paket" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Level / Rank (Angka)" 
                            type="number"
                            value={data.level} 
                            onChange={e => setData('level', e.target.value)} 
                            error={errors.level} 
                        />
                        <Input 
                            label="Harga Upgrade (Rp)" 
                            type="number"
                            value={data.price} 
                            onChange={e => setData('price', e.target.value)} 
                            error={errors.price} 
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="edit_is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="edit_is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Tersedia Untuk Dibeli</label>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Paket Member"
                message={`Apakah Anda yakin ingin menghapus paket "${selectedTier?.name}"? Jika ada user yang terdaftar pada paket ini, paket TIDAK AKAN dapat dihapus sebelum Anda memindahkan user tersebut.`}
            />
        </AdminLayout>
    );
}
