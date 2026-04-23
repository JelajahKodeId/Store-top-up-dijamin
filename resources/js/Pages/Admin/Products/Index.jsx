import { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input, { Select, Textarea } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function ProductIndex({ products, filters }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'fields', 'durations'

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        slug: '',
        description: '',
        image: '',
        image_file: null,
        telegram_group_invite_url: '',
        status: 'active',
        platform_type: '',
        game_category: '',
        fields: [],
        durations: [{ name: '', duration_days: '', price: '', reseller_price: '', is_active: true }],
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setActiveTab('basic');
        setIsCreateModalOpen(true);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setActiveTab('basic');
        setData({
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            image: product.image || '',
            image_file: null,
            telegram_group_invite_url: product.telegram_group_invite_url || '',
            status: product.status,
            platform_type: product.platform_type || '',
            game_category: product.game_category || '',
            fields: product.fields || [],
            durations: product.durations || [],
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        const useMultipart = data.image_file instanceof File;
        post(route('admin.products.store'), {
            forceFormData: useMultipart,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        const useMultipart = data.image_file instanceof File;
        put(route('admin.products.update', selectedProduct.id), {
            forceFormData: useMultipart,
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

    // Auto-generate slug from name (for create modal)
    useEffect(() => {
        if (isCreateModalOpen && data.name) {
            setData('slug', data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
        }
    }, [data.name]);

    // Auto-derive field name from label (snake_case)
    const slugifyFieldName = (label) =>
        label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

    // Dynamic Fields Logic
    const addField = () => setData('fields', [...data.fields, { name: '', label: '', type: 'text', placeholder: '', is_required: true, sort_order: data.fields.length + 1 }]);
    const removeField = (idx) => {
        const f = [...data.fields]; f.splice(idx, 1); setData('fields', f);
    };
    const updateField = (idx, k, v) => {
        const f = [...data.fields]; f[idx][k] = v; setData('fields', f);
    };

    // Durations Logic
    const addDuration = () => setData('durations', [...data.durations, { name: '', duration_days: '', price: '', reseller_price: '', is_active: true }]);
    const removeDuration = (idx) => {
        const d = [...data.durations]; d.splice(idx, 1); setData('durations', d);
    };
    const updateDuration = (idx, k, v) => {
        const d = [...data.durations]; d[idx][k] = v; setData('durations', d);
    };

    return (
        <AdminLayout
            title="Manajemen Produk"
            subtitle="Atur ketersediaan, field dinamis, dan durasi"
        >
            <Head title="Manajemen Produk" />

            <AdminTable
                title="Daftar Produk"
                subtitle={`${products.meta.total} Total Produk`}
                onSearch={handleSearch}
                pagination={products.meta}
                actions={
                    <>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Draft</option>
                        </select>

                        <Button variant="dark" size="md" onClick={openCreateModal} icon={AppIcons.plus}>
                            Tambah Produk
                        </Button>
                    </>
                }
                headers={[
                    { label: 'Produk', className: 'w-[26%]' },
                    { label: 'Platform', className: 'w-[10%]' },
                    { label: 'Game', className: 'w-[12%] hidden md:table-cell' },
                    { label: 'Varian', className: 'w-[14%]' },
                    { label: 'Stok Key', className: 'w-[14%]' },
                    { label: 'Status', className: 'w-[12%]' },
                    { label: 'Aksi', className: 'w-[12%] text-right' },
                ]}
            >
                {products.data.map((product) => (
                    <tr key={product.id}>
                        <td>
                            <div className="flex flex-col">
                                <span className="font-black text-store-charcoal text-sm">{product.name}</span>
                                <span className="text-[10px] text-store-subtle uppercase font-bold tracking-widest">{product.slug}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center gap-1.5">
                                {product.platform_type === 'android' && (
                                    <Badge variant="gray" className="gap-1 px-1.5 py-0.5">
                                        <AppIcons.android size={10} />
                                        <span className="text-[9px] font-bold">Android</span>
                                    </Badge>
                                )}
                                {product.platform_type === 'ios' && (
                                    <Badge variant="gray" className="gap-1 px-1.5 py-0.5">
                                        <AppIcons.ios size={10} />
                                        <span className="text-[9px] font-bold">iOS</span>
                                    </Badge>
                                )}
                                {product.platform_type === 'both' && (
                                    <Badge variant="gray" className="gap-1 px-1.5 py-0.5">
                                        <div className="flex items-center -space-x-1">
                                            <AppIcons.android size={9} />
                                            <AppIcons.ios size={9} />
                                        </div>
                                        <span className="text-[9px] font-bold">Mobile</span>
                                    </Badge>
                                )}
                                {!product.platform_type && <span className="text-[10px] text-store-subtle font-bold">—</span>}
                            </div>
                        </td>
                        <td className="hidden md:table-cell">
                            {product.game_category_label ? (
                                <span className="text-[10px] font-bold uppercase tracking-wide text-store-charcoal">
                                    {product.game_category_label}
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-store-subtle">—</span>
                            )}
                        </td>
                        <td>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-store-charcoal">{product.durations.length} Durasi</span>
                                <span className="text-[10px] text-store-subtle font-bold uppercase tracking-tight">{product.fields.length} Fields</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <Badge variant={product.keys_count > 0 ? 'charcoal' : 'gray'} className="w-fit">
                                    {product.keys_count} Ready
                                </Badge>
                                <Link href={route('admin.products.keys.index', product.id)} className="p-1.5 rounded-lg bg-store-accent/10 text-store-accent hover:bg-store-accent hover:text-white transition-all" title="Manage Keys">
                                    <AppIcons.key size={12} />
                                </Link>
                            </div>
                        </td>
                        <td>
                            <Badge variant={product.status === 'active' ? 'accent' : 'gray'} className="w-fit">
                                {product.status === 'active' ? 'Aktif' : 'Draft'}
                            </Badge>
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
                                    <AppIcons.edit size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(product)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <AppIcons.delete size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Create/Edit Modal */}
            <Modal
                show={isCreateModalOpen || isEditModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                title={isEditModalOpen ? 'Edit Produk Digital' : 'Tambah Produk Baru'}
                maxWidth="5xl"
                padding={false}
                onSubmit={isEditModalOpen ? submitEdit : submitCreate}
                headerExtra={
                    <div className="flex items-center gap-1 sm:gap-2 px-6 sm:px-8 border-t border-store-border overflow-x-auto scrollbar-hide py-3 sm:py-4 bg-admin-bg/30">
                        {[
                            { id: 'basic', label: 'Info Dasar', icon: AppIcons.dashboard },
                            { id: 'fields', label: 'Input Data', icon: AppIcons.plus },
                            { id: 'durations', label: 'Harga & Varian', icon: AppIcons.categories }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap font-sans ${activeTab === tab.id
                                    ? 'bg-store-charcoal text-white shadow-soft'
                                    : 'text-store-muted hover:bg-store-border hover:text-store-charcoal'
                                    }`}
                            >
                                <tab.icon size={14} />
                                <span className={activeTab === tab.id ? 'block' : 'hidden sm:block'}>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                }
                footer={
                    <div className="flex items-center justify-between gap-4">
                        <div className="hidden sm:flex flex-col">
                            <span className="text-[9px] font-black text-store-subtle uppercase tracking-widest leading-none font-sans">Drafting</span>
                            <span className="text-xs font-black text-store-charcoal uppercase tracking-tighter leading-normal font-sans">{data.name || 'Produk Tanpa Nama'}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="ghost" type="button" className="flex-1 sm:flex-initial" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Batal</Button>
                            <Button variant="dark" onClick={isEditModalOpen ? submitEdit : submitCreate} loading={processing} className="flex-1 sm:flex-initial">{isEditModalOpen ? 'Simpan Perubahan' : 'Buat Produk'}</Button>
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col h-full">
                    {activeTab === 'basic' && (
                        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest border-b border-store-border pb-3">Informasi Utama</h4>
                                    <Input label="Nama Produk" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: Mobile Legends" />
                                    <Input label="Slug (URL)" value={data.slug} onChange={e => setData('slug', e.target.value)} error={errors.slug} />
                                    <Textarea label="Deskripsi" value={data.description} onChange={e => setData('description', e.target.value)} error={errors.description} rows={4} />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest border-b border-store-border pb-3">Status & Brand</h4>
                                    <Input
                                        label="URL gambar (opsional)"
                                        value={data.image}
                                        onChange={e => setData('image', e.target.value)}
                                        error={errors.image}
                                        placeholder="https://… atau kosongkan jika unggah file"
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-store-subtle uppercase tracking-widest block">
                                            Unggah gambar (opsional)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="block w-full text-xs font-medium text-store-charcoal file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-store-charcoal file:text-white file:font-bold"
                                            onChange={(e) => setData('image_file', e.target.files?.[0] ?? null)}
                                        />
                                        {errors.image_file && (
                                            <p className="text-[10px] font-bold text-red-600">{errors.image_file}</p>
                                        )}
                                        <p className="text-[9px] text-store-subtle font-medium leading-relaxed">
                                            Jika file dipilih, file dipakai dan disimpan di <code className="text-[8px] bg-admin-bg px-1 rounded">storage/app/public/products</code>
                                            (pastikan <code className="text-[8px] bg-admin-bg px-1 rounded">php artisan storage:link</code> sudah dijalankan).
                                        </p>
                                    </div>
                                    <Select label="Status Produk" value={data.status} onChange={e => setData('status', e.target.value)} error={errors.status}>
                                        <option value="active">Aktif (Tampil di Toko)</option>
                                        <option value="inactive">Draft (Sembunyikan)</option>
                                    </Select>
                                    <Select label="Tipe Platform" value={data.platform_type} onChange={e => setData('platform_type', e.target.value)} error={errors.platform_type}>
                                        <option value="">Tidak Ditentukan / Universal</option>
                                        <option value="android">Android Only</option>
                                        <option value="ios">iOS Only</option>
                                        <option value="both">Android & iOS</option>
                                    </Select>
                                    <div className="space-y-2">
                                        <Input
                                            label="Kategori game (opsional)"
                                            value={data.game_category}
                                            onChange={(e) =>
                                                setData(
                                                    'game_category',
                                                    e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                                                )
                                            }
                                            error={errors.game_category}
                                            placeholder="mis. mlbb, roblox, pubgm"
                                            list="admin-game-category-presets"
                                        />
                                        <datalist id="admin-game-category-presets">
                                            <option value="mlbb" />
                                            <option value="roblox" />
                                            <option value="pubgm" />
                                            <option value="ff" />
                                            <option value="genshin" />
                                            <option value="valorant" />
                                            <option value="minecraft" />
                                            <option value="steam" />
                                        </datalist>
                                        <p className="text-[9px] font-medium leading-relaxed text-store-subtle">
                                            Slug kecil (huruf/angka, tanda hubung). Kosongkan untuk produk tanpa filter game — aman untuk data lama.
                                        </p>
                                    </div>
                                    <Input
                                        label="Link undangan grup Telegram (opsional)"
                                        value={data.telegram_group_invite_url}
                                        onChange={e => setData('telegram_group_invite_url', e.target.value)}
                                        error={errors.telegram_group_invite_url}
                                        placeholder="https://t.me/+xxxx atau https://t.me/joinchat/…"
                                    />
                                    <div className="p-4 bg-admin-bg rounded-2xl border border-store-border border-dashed text-center">
                                        <p className="text-[10px] font-bold text-store-subtle uppercase tracking-tight">Ketik Nama untuk auto-slug</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fields' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
                            <div className="sticky top-0 z-20 bg-white border-b border-store-border px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest">Kustom Field Input</h4>
                                    <p className="text-[9px] font-bold text-store-subtle uppercase mt-1">Data pembeli (misal: ID)</p>
                                </div>
                                <Button type="button" variant="dark" size="sm" onClick={addField} icon={AppIcons.plus}>Tambah Field</Button>
                            </div>
                            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.fields.map((field, idx) => (
                                    <div key={idx} className="p-5 bg-white rounded-2xl border border-store-border relative group shadow-sm hover:shadow-md transition-all">
                                        <button type="button" onClick={() => removeField(idx)} className="absolute top-3 right-3 text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all">
                                            <AppIcons.delete size={16} />
                                        </button>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-admin-bg pb-3 mr-8">
                                                <div className="w-6 h-6 rounded-lg bg-store-charcoal text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                                                <span className="text-[10px] font-black text-store-charcoal uppercase tracking-wider">Field {idx + 1}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <Input
                                                    label="Label (Tampil ke User)"
                                                    value={field.label}
                                                    onChange={e => {
                                                        const newLabel = e.target.value;
                                                        const autoName = !field.name || field.name === slugifyFieldName(field.label);
                                                        const updated = [...data.fields];
                                                        updated[idx] = {
                                                            ...updated[idx],
                                                            label: newLabel,
                                                            ...(autoName ? { name: slugifyFieldName(newLabel) } : {}),
                                                        };
                                                        setData('fields', updated);
                                                    }}
                                                    placeholder="Contoh: HWID (Hardware ID)"
                                                />
                                                <Input
                                                    label="Nama Field (Key)"
                                                    value={field.name}
                                                    onChange={e => updateField(idx, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                                                    placeholder="Contoh: user_id"
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select label="Tipe Input" value={field.type} onChange={e => updateField(idx, 'type', e.target.value)}>
                                                        <option value="text">Teks Bebas</option>
                                                        <option value="number">Hanya Angka</option>
                                                        <option value="email">Email</option>
                                                        <option value="textarea">Teks Panjang</option>
                                                    </Select>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold text-store-subtle uppercase tracking-widest block">Wajib Isi?</label>
                                                        <div className="flex items-center h-10 gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.is_required}
                                                                onChange={e => updateField(idx, 'is_required', e.target.checked)}
                                                                className="w-5 h-5 rounded-md text-store-charcoal border-store-border"
                                                            />
                                                            <span className="text-[10px] font-black text-store-charcoal uppercase italic">Wajib</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data.fields.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-store-border rounded-3xl bg-admin-bg/30">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-soft">
                                            <AppIcons.plus className="text-store-muted" size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-store-subtle uppercase tracking-[0.2em]">Belum ada field tambahan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'durations' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">
                            <div className="sticky top-0 z-20 bg-white border-b border-store-border px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="text-[10px] font-black text-store-charcoal uppercase tracking-widest">Daftar Varian & Harga</h4>
                                    <p className="text-[9px] font-bold text-store-subtle uppercase mt-1">Denominasi produk & harga</p>
                                </div>
                                <Button type="button" variant="dark" size="sm" onClick={addDuration} icon={AppIcons.plus}>Tambah Varian</Button>
                            </div>
                            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {data.durations.map((dur, idx) => (
                                    <div key={idx} className="p-5 bg-white rounded-2xl border border-store-border relative group shadow-sm hover:shadow-md transition-all">
                                        <button type="button" onClick={() => removeDuration(idx)} className="absolute top-3 right-3 text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all">
                                            <AppIcons.delete size={16} />
                                        </button>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-admin-bg pb-3 mr-8">
                                                <div className="w-6 h-6 rounded-lg bg-store-accent text-white flex items-center justify-center text-xs font-black">
                                                    <AppIcons.success size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-store-charcoal uppercase tracking-wider">Varian {idx + 1}</span>
                                            </div>
                                            <Input label="Nama Denom / Paket" value={dur.name} onChange={e => updateDuration(idx, 'name', e.target.value)} placeholder="Contoh: 86 Diamonds" />
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <Input label="Masa Aktif (Hari)" type="number" value={dur.duration_days} onChange={e => updateDuration(idx, 'duration_days', e.target.value)} placeholder="0" />
                                                <Input label="Harga Normal (Rp)" type="number" value={dur.price} onChange={e => updateDuration(idx, 'price', e.target.value)} placeholder="50000" />
                                                <Input label="Harga Reseller (Rp)" type="number" value={dur.reseller_price || ''} onChange={e => updateDuration(idx, 'reseller_price', e.target.value)} placeholder="Opsional" />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={dur.is_active}
                                                    onChange={e => updateDuration(idx, 'is_active', e.target.checked)}
                                                    className="w-4 h-4 rounded text-store-charcoal border-store-border"
                                                />
                                                <span className="text-[10px] font-black text-store-charcoal uppercase italic">Varian Aktif</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {data.durations.length === 0 && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-store-border rounded-3xl bg-admin-bg/30">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-soft">
                                            <AppIcons.categories className="text-store-muted" size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-store-subtle uppercase tracking-[0.2em]">Belum ada varian produk</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Produk"
                message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct?.name}"? Data penjualan yang berkaitan mungkin akan terpengaruh.`}
            />
        </AdminLayout>
    );
}
