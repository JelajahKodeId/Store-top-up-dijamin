import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input, { Textarea } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function CategoryIndex({ categories, filters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        image_url: '',
        description: '',
        fields: [],
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setData({
            name: category.name,
            image_url: category.image_url.includes('ui-avatars') ? '' : category.image_url,
            description: category.description || '',
            fields: category.fields || [],
            is_active: category.is_active,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const addField = () => {
        setData('fields', [...data.fields, { name: '', label: '', placeholder: '' }]);
    };

    const removeField = (index) => {
        const newFields = [...data.fields];
        newFields.splice(index, 1);
        setData('fields', newFields);
    };

    const updateField = (index, key, value) => {
        const newFields = [...data.fields];
        newFields[index][key] = value;
        setData('fields', newFields);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', selectedCategory.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.categories.destroy', selectedCategory.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    const handleSearch = (val) => {
        router.get(route('admin.categories.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const PlusIcon = AppIcons.plus;
    const EditIcon = AppIcons.edit;
    const TrashIcon = AppIcons.delete;
    const ImageIcon = AppIcons.banners;

    const FieldsManager = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-store-charcoal uppercase tracking-widest">Definisi Input Fields</label>
                <button
                    type="button"
                    onClick={addField}
                    className="text-[10px] font-black text-store-accent uppercase tracking-widest hover:underline"
                >
                    + Tambah Field
                </button>
            </div>
            {data.fields.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-store-border text-center">
                    <span className="text-[10px] font-bold text-store-subtle uppercase">Tidak ada field tambahan (Default: No Input)</span>
                </div>
            )}
            <div className="space-y-3">
                {data.fields.map((field, index) => (
                    <div key={index} className="p-4 rounded-xl border border-store-border bg-admin-bg relative group">
                        <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                        >
                            <TrashIcon size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-store-subtle uppercase tracking-widest">Key Name (slug)</label>
                                <input
                                    type="text"
                                    value={field.name}
                                    onChange={e => updateField(index, 'name', e.target.value)}
                                    placeholder="e.g: target_id"
                                    className="w-full text-xs font-bold p-2 rounded-lg border-store-border focus:ring-store-accent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-store-subtle uppercase tracking-widest">Label Display</label>
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={e => updateField(index, 'label', e.target.value)}
                                    placeholder="e.g: User ID"
                                    className="w-full text-xs font-bold p-2 rounded-lg border-store-border focus:ring-store-accent"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-store-subtle uppercase tracking-widest">Placeholder</label>
                                <input
                                    type="text"
                                    value={field.placeholder}
                                    onChange={e => updateField(index, 'placeholder', e.target.value)}
                                    placeholder="e.g: Masukkan ID..."
                                    className="w-full text-xs font-bold p-2 rounded-lg border-store-border focus:ring-store-accent"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AdminLayout
            title="Manajemen Kategori"
            subtitle="Kelola kategori game dan produk digital Anda"
        >
            <Head title="Manajemen Kategori" />

            <AdminTable
                title="Daftar Kategori"
                subtitle={`${categories.meta.total} Total Kategori`}
                onSearch={handleSearch}
                pagination={categories.meta}
                actions={
                    <Button
                        variant="dark"
                        size="md"
                        onClick={openCreateModal}
                        icon={PlusIcon}
                    >
                        Tambah Kategori
                    </Button>
                }
                headers={[
                    { label: 'Kategori', className: 'w-[40%]' },
                    { label: 'Status', className: 'w-[20%]' },
                    { label: 'Produk', className: 'w-[20%]' },
                    { label: 'Aksi', className: 'w-[20%] text-right' }
                ]}
            >
                {categories.data.map((category) => (
                    <tr key={category.id}>
                        <td>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl border border-store-border overflow-hidden bg-admin-bg flex-shrink-0">
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random`; }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-store-charcoal text-sm">{category.name}</span>
                                    <span className="text-[10px] text-store-subtle uppercase font-bold tracking-tight line-clamp-1">{category.description || 'Tidak ada deskripsi'}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <Badge variant={category.is_active ? 'accent' : 'gray'}>
                                {category.is_active ? 'Aktif' : 'Non-aktif'}
                            </Badge>
                        </td>
                        <td>
                            <div className="flex items-center gap-1.5">
                                <span className="font-black text-store-charcoal text-sm">{category.products_count || 0}</span>
                                <span className="text-[10px] font-bold text-store-muted uppercase tracking-widest">Produk</span>
                            </div>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={route('admin.categories.show', category.id)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.view size={16} />
                                </Link>
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <EditIcon size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(category)}
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
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Kategori">
                <form onSubmit={submitCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nama Kategori"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="Contoh: Mobile Legends"
                            icon="categories"
                        />
                        <Input
                            label="URL Gambar / Icon"
                            value={data.image_url}
                            onChange={e => setData('image_url', e.target.value)}
                            error={errors.image_url}
                            placeholder="https://..."
                            icon="banners"
                        />
                    </div>
                    <Textarea
                        label="Deskripsi Singkat"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        error={errors.description}
                        placeholder="Tulis deskripsi kategori di sini..."
                    />

                    <hr className="border-store-border" />

                    <FieldsManager />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="w-5 h-5 rounded-md border-store-border text-store-charcoal focus:ring-store-accent"
                        />
                        <label htmlFor="is_active" className="text-xs font-black text-store-charcoal uppercase tracking-tight cursor-pointer">
                            Kategori Aktif & Ditampilkan
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" loading={processing}>Simpan Kategori</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Kategori">
                <form onSubmit={submitEdit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nama Kategori" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} icon="categories" />
                        <Input label="URL Gambar / Icon" value={data.image_url} onChange={e => setData('image_url', e.target.value)} error={errors.image_url} icon="banners" />
                    </div>
                    <Textarea label="Deskripsi Singkat" value={data.description} onChange={e => setData('description', e.target.value)} error={errors.description} />

                    <hr className="border-store-border" />

                    <FieldsManager />

                    <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="w-5 h-5 rounded-md border-store-border text-store-charcoal focus:ring-store-accent"
                        />
                        <label htmlFor="edit_is_active" className="text-xs font-black text-store-charcoal uppercase tracking-tight cursor-pointer">
                            Kategori Aktif & Ditampilkan
                        </label>
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
                title="Hapus Kategori"
                message={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"? Seluruh produk yang berkaitan dengan kategori ini mungkin tidak akan ditampilkan.`}
            />
        </AdminLayout>
    );
}
