import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function GameFooterIndex({ gameFooters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGameFooter, setSelectedGameFooter] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setImagePreview(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (gameFooter) => {
        setSelectedGameFooter(gameFooter);
        setData({
            _method: 'put',
            name: gameFooter.name,
            image: null, 
        });
        setImagePreview(gameFooter.image);
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.game-footers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        post(route('admin.game-footers.update', selectedGameFooter.id), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (gameFooter) => {
        setSelectedGameFooter(gameFooter);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.game-footers.destroy', selectedGameFooter.id), {
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
            title="Manajemen Game Footer"
            subtitle="Atur gambar game yang muncul di bagian footer"
        >
            <Head title="Manajemen Game Footer" />

            <div className="mb-8 flex justify-end">
                <Button variant="dark" onClick={openCreateModal} icon={AppIcons.plus}>Tambah Gambar</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gameFooters.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-sm flex flex-col group">
                        <div className="aspect-square bg-admin-bg relative overflow-hidden flex items-center justify-center p-4">
                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-black text-store-charcoal text-sm tracking-tighter uppercase text-center mb-4 truncate" title={item.name}>{item.name}</h3>

                            <div className="mt-auto flex items-center justify-center gap-2">
                                <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.edit size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(item)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <AppIcons.delete size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tambah Gambar Game"
                onSubmit={submitCreate}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitCreate} loading={processing}>Simpan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Game" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="Mobile Legends" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">File Gambar</label>
                        <div className="flex flex-col gap-4">
                            <div className="aspect-video rounded-2xl border-2 border-dashed border-store-border bg-admin-bg relative overflow-hidden group">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white uppercase">Ganti Gambar</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                        <AppIcons.plus size={24} className="text-store-subtle" />
                                        <span className="text-[10px] font-black text-store-subtle uppercase">Pilih File</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            {errors.image && <p className="text-[10px] font-black text-red-500 uppercase italic leading-none">{errors.image}</p>}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Gambar Game"
                onSubmit={submitEdit}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitEdit} loading={processing}>Simpan Perubahan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Game" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">File Gambar (Kosongkan jika tidak ganti)</label>
                        <div className="flex flex-col gap-4">
                            <div className="aspect-video rounded-2xl border-2 border-dashed border-store-border bg-admin-bg relative overflow-hidden group">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white uppercase">Ganti Gambar</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                        <AppIcons.plus size={24} className="text-store-subtle" />
                                        <span className="text-[10px] font-black text-store-subtle uppercase">Pilih File</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            {errors.image && <p className="text-[10px] font-black text-red-500 uppercase italic leading-none">{errors.image}</p>}
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Gambar Game"
                message={`Apakah Anda yakin ingin menghapus gambar game "${selectedGameFooter?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AdminLayout>
    );
}
