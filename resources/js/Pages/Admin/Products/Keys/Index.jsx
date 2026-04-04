import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import { Select, Textarea } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';
import { useState } from 'react';

export default function KeyIndex({ product, durations, keys, filters }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        product_duration_id: durations[0]?.id || '',
        keys: '',
    });

    const handleSearch = (val) => {
        router.get(route('admin.products.keys.index', product.id), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleFilter = (key, val) => {
        router.get(route('admin.products.keys.index', product.id), { ...filters, [key]: val }, { preserveState: true });
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('admin.products.keys.store', product.id), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset('keys');
            },
        });
    };

    const openDeleteModal = (key) => {
        setSelectedKey(key);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.products.keys.destroy', selectedKey.id), {
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
            title={`Inventori Key: ${product.name}`}
            subtitle="Kelola stok kode lisensi atau serial key"
        >
            <Head title={`Stok Key - ${product.name}`} />

            <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-store-border">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.products.show', product.id)} className="p-2 rounded-xl bg-admin-bg hover:bg-store-border transition-colors">
                        <AppIcons.back size={20} />
                    </Link>
                    <div>
                        <h3 className="font-black text-store-charcoal uppercase tracking-tighter">Tambah Stok Key</h3>
                        <p className="text-[10px] text-store-subtle font-bold uppercase tracking-widest">Gunakan bulk input untuk memasukkan banyak key sekaligus</p>
                    </div>
                </div>
                <Button variant="dark" onClick={() => setIsAddModalOpen(true)} icon={AppIcons.plus}>Tambah Key</Button>
            </div>

            <AdminTable
                title="Daftar Key"
                subtitle={`${keys.total} Total Key`}
                onSearch={handleSearch}
                pagination={keys}
                actions={
                    <>
                        <select
                            value={filters.duration_id || ''}
                            onChange={(e) => handleFilter('duration_id', e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Durasi</option>
                            {durations.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="expired">Expired</option>
                        </select>
                    </>
                }
                headers={[
                    { label: 'Kode Key', className: 'w-[40%]' },
                    { label: 'Varian / Durasi', className: 'w-[30%]' },
                    { label: 'Status', className: 'w-[15%]' },
                    { label: 'Aksi', className: 'w-[15%] text-right' }
                ]}
            >
                {keys.data.map((key) => (
                    <tr key={key.id}>
                        <td>
                            <code className="bg-admin-bg px-3 py-1.5 rounded-lg border border-store-border font-mono text-xs font-bold text-store-charcoal">
                                {key.key_code}
                            </code>
                        </td>
                        <td>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-store-charcoal">{key.duration.name}</span>
                                <span className="text-[10px] text-store-subtle font-bold uppercase tracking-widest">{key.duration.duration_days} Hari</span>
                            </div>
                        </td>
                        <td>
                            <Badge variant={key.status === 'available' ? 'accent' : key.status === 'sold' ? 'charcoal' : 'gray'}>
                                {key.status.toUpperCase()}
                            </Badge>
                        </td>
                        <td className="text-right">
                            {key.status !== 'sold' && (
                                <button
                                    onClick={() => openDeleteModal(key)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <AppIcons.delete size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <Modal
                show={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Stok Key (Bulk)"
                onSubmit={submitAdd}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitAdd} loading={processing}>Simpan Key</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Select
                        label="Pilih Varian / Durasi"
                        value={data.product_duration_id}
                        onChange={e => setData('product_duration_id', e.target.value)}
                        error={errors.product_duration_id}
                    >
                        {durations.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.duration_days} Hari)</option>
                        ))}
                    </Select>

                    <Textarea
                        label="Kode Key (Satu per baris)"
                        value={data.keys}
                        onChange={e => setData('keys', e.target.value)}
                        error={errors.keys}
                        placeholder={"KEY-123\nKEY-456\nKEY-789"}
                        rows={10}
                    />
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Product Key"
                message={`Apakah Anda yakin ingin menghapus product key ini? Tindakan ini tidak dapat dibatalkan.`}
            />
        </AdminLayout>
    );
}
