import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input, { Select } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function ProductIndex({ products, categories, filters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        category_id: '',
        name: '',
        sku: '',
        price: '',
        discount_price: '',
        is_active: true,
        is_available: true,
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setData({
            category_id: product.category_id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            discount_price: product.discount_price || '',
            is_active: product.is_active,
            is_available: product.is_available,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.products.update', selectedProduct.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.products.destroy', selectedProduct.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    const handleSearch = (val) => {
        router.get(route('admin.products.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleFilter = (key, val) => {
        router.get(route('admin.products.index'), { ...filters, [key]: val }, { preserveState: true });
    };

    const PlusIcon = AppIcons.plus;
    const EditIcon = AppIcons.edit;
    const TrashIcon = AppIcons.delete;
    const TagIcon = AppIcons.categories;

    return (
        <AdminLayout
            title="Manajemen Produk"
            subtitle="Atur ketersediaan dan harga paket top-up Anda"
        >
            <Head title="Manajemen Produk" />

            <AdminTable
                title="Daftar Produk / Paket"
                subtitle={`${products.meta.total} Total Produk`}
                onSearch={handleSearch}
                pagination={products.meta}
                actions={
                    <>
                        <select
                            value={filters.category_id || ''}
                            onChange={(e) => handleFilter('category_id', e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <Button
                            variant="dark"
                            size="md"
                            onClick={openCreateModal}
                            icon={PlusIcon}
                        >
                            Tambah Produk
                        </Button>
                    </>
                }
                headers={[
                    { label: 'Produk & SKU', className: 'w-[35%]' },
                    { label: 'Kategori', className: 'w-[15%]' },
                    { label: 'Harga', className: 'w-[20%]' },
                    { label: 'Status', className: 'w-[15%]' },
                    { label: 'Aksi', className: 'w-[15%] text-right' }
                ]}
            >
                {products.data.map((product) => (
                    <tr key={product.id}>
                        <td>
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm">{product.name}</span>
                                <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{product.sku}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-admin-bg flex items-center justify-center text-store-muted border border-store-border">
                                    <TagIcon size={12} />
                                </div>
                                <span className="text-xs font-bold text-store-charcoal">{product.category?.name}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex flex-col">
                                {product.discount_price ? (
                                    <>
                                        <span className="text-sm font-black text-green-600">{product.discount_price_formatted}</span>
                                        <span className="text-[10px] font-bold text-store-subtle line-through opacity-60">{product.price_formatted}</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-black text-store-charcoal">{product.price_formatted}</span>
                                )}
                            </div>
                        </td>
                        <td>
                            <div className="flex flex-col gap-1">
                                <Badge variant={product.is_active ? 'accent' : 'gray'} className="w-fit">
                                    {product.is_active ? 'Aktif' : 'Draft'}
                                </Badge>
                                <Badge variant={product.is_available ? 'charcoal' : 'gray'} className="w-fit">
                                    {product.is_available ? 'Tersedia' : 'Habis'}
                                </Badge>
                            </div>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={route('admin.products.show', product.id)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <AppIcons.view size={16} />
                                </Link>
                                <button
                                    onClick={() => openEditModal(product)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                >
                                    <EditIcon size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(product)}
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
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tambah Produk Baru">
                <form onSubmit={submitCreate} className="space-y-6">
                    <Select
                        label="Kategori"
                        value={data.category_id}
                        onChange={e => setData('category_id', e.target.value)}
                        error={errors.category_id}
                        icon="categories"
                    >
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Nama Produk" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: 86 Diamonds" />
                        <Input label="SKU / Kode" value={data.sku} onChange={e => setData('sku', e.target.value)} error={errors.sku} placeholder="ML-86D" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Harga Normal" type="number" value={data.price} onChange={e => setData('price', e.target.value)} error={errors.price} placeholder="20000" />
                        <Input label="Harga Diskon (Opsional)" type="number" value={data.discount_price} onChange={e => setData('discount_price', e.target.value)} error={errors.discount_price} placeholder="18500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                            <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                            <label htmlFor="is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Tampilkan Produk</label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                            <input type="checkbox" id="is_available" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                            <label htmlFor="is_available" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Stok Tersedia</label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" loading={processing}>Simpan Produk</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Produk / Paket">
                <form onSubmit={submitEdit} className="space-y-6">
                    <Select label="Kategori" value={data.category_id} onChange={e => setData('category_id', e.target.value)} error={errors.category_id} icon="categories">
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </Select>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Nama Produk" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                        <Input label="SKU / Kode" value={data.sku} onChange={e => setData('sku', e.target.value)} error={errors.sku} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Harga Normal" type="number" value={data.price} onChange={e => setData('price', e.target.value)} error={errors.price} />
                        <Input label="Harga Diskon" type="number" value={data.discount_price} onChange={e => setData('discount_price', e.target.value)} error={errors.discount_price} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                            <input type="checkbox" id="edit_is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                            <label htmlFor="edit_is_active" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Tampilkan Produk</label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-admin-bg rounded-xl border border-store-border">
                            <input type="checkbox" id="edit_is_available" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} className="w-5 h-5 rounded-md text-store-charcoal" />
                            <label htmlFor="edit_is_available" className="text-[10px] font-black text-store-charcoal uppercase tracking-tight cursor-pointer">Stok Tersedia</label>
                        </div>
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
                title="Hapus Produk"
                message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct?.name}"? Data transaksi yang berkaitan mungkin akan terpengaruh.`}
            />
        </AdminLayout>
    );
}
