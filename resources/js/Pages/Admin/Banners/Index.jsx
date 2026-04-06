import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function BannerIndex({ banners }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        image: null,
        link: '',
        is_active: true,
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Cabut URL objek lama sebelum buat yang baru agar tidak memory leak
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

    const openEditModal = (banner) => {
        setSelectedBanner(banner);
        setData({
            _method: 'put',
            title: banner.title,
            image: null, // Don't send old image path as file
            link: banner.link || '',
            is_active: banner.is_active,
        });
        setImagePreview(banner.image);
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.banners.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        post(route('admin.banners.update', selectedBanner.id), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (banner) => {
        setSelectedBanner(banner);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.banners.destroy', selectedBanner.id), {
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
            title="Manajemen Banner"
            subtitle="Atur slider promo di halaman depan"
        >
            <Head title="Manajemen Banner" />

            <div className="mb-8 flex justify-end">
                <Button variant="dark" onClick={openCreateModal} icon={AppIcons.plus}>Tambah Banner</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-sm flex flex-col group">
                        <div className="aspect-[21/9] bg-admin-bg relative overflow-hidden">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4">
                                <Badge variant={banner.is_active ? 'accent' : 'gray'}>
                                    {banner.is_active ? 'Aktif' : 'Draft'}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="font-black text-store-charcoal text-lg tracking-tighter uppercase mb-1">{banner.title}</h3>
                            <p className="text-[10px] text-store-subtle font-bold truncate mb-6">{banner.link || 'No Link'}</p>

                            <div className="mt-auto flex items-center justify-end gap-2">
                                <button
                                    onClick={() => openEditModal(banner)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.edit size={18} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(banner)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <AppIcons.delete size={18} />
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
                title="Tambah Banner Baru"
                onSubmit={submitCreate}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitCreate} loading={processing}>Simpan Banner</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Judul Banner" value={data.title} onChange={e => setData('title', e.target.value)} error={errors.title} placeholder="Promo Ramadhan" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">File Banner</label>
                        <div className="flex flex-col gap-4">
                            <div className="aspect-[21/9] rounded-2xl border-2 border-dashed border-store-border bg-admin-bg relative overflow-hidden group">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover" />
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

                    <Input label="Link Tujuan (URL)" value={data.link} onChange={e => setData('link', e.target.value)} error={errors.link} placeholder="https://..." />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Banner Aktif</label>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Banner"
                onSubmit={submitEdit}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitEdit} loading={processing}>Simpan Perubahan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Judul Banner" value={data.title} onChange={e => setData('title', e.target.value)} error={errors.title} />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest block font-sans">File Banner (Kosongkan jika tidak ganti)</label>
                        <div className="flex flex-col gap-4">
                            <div className="aspect-[21/9] rounded-2xl border-2 border-dashed border-store-border bg-admin-bg relative overflow-hidden group">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover" />
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

                    <Input label="Link Tujuan (URL)" value={data.link} onChange={e => setData('link', e.target.value)} error={errors.link} />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input type="checkbox" id="edit_is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal font-sans" />
                        <label htmlFor="edit_is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer font-sans">Banner Aktif</label>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Banner"
                message={`Apakah Anda yakin ingin menghapus banner "${selectedBanner?.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AdminLayout>
    );
}
