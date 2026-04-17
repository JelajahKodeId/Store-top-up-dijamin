import { useState } from 'react';
import { Head, router, useForm, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/ui/AdminTable';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import Modal from '@/Components/ui/Modal';
import Input, { Select } from '@/Components/ui/Input';
import DeleteConfirmModal from '@/Components/ui/DeleteConfirmModal';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function UserIndex({ users, filters }) {
    const { auth } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [processingDelete, setProcessingDelete] = useState(false);

    // Form for Create/Edit
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone_number: '',
        role: 'member',
        password: '',
        password_confirmation: '',
        member_tier: 'standard',
        balance: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number || '',
            role: user.role,
            password: '',
            password_confirmation: '',
            member_tier: user.member_tier || 'standard',
            balance: user.balance ?? '',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setProcessingDelete(true);
        router.delete(route('admin.users.destroy', selectedUser.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessingDelete(false);
            },
            onError: () => setProcessingDelete(false),
            onFinish: () => setProcessingDelete(false),
        });
    };

    const handleSearch = (val) => {
        router.get(route('admin.users.index'), { ...filters, search: val }, { preserveState: true, replace: true });
    };

    const handleRoleFilter = (role) => {
        router.get(route('admin.users.index'), { ...filters, role: role }, { preserveState: true });
    };

    const PlusIcon = AppIcons.plus;
    const EditIcon = AppIcons.edit;
    const TrashIcon = AppIcons.delete;
    const EyeIcon = AppIcons.view;

    return (
        <AdminLayout
            title="Manajemen Pengguna"
            subtitle="Kelola akun, role, saldo dompet, dan level paket member"
        >
            <Head title="Manajemen Pengguna" />

            <AdminTable
                title="Daftar Pengguna"
                subtitle={`${users.meta.total} Total Pengguna Terdaftar`}
                onSearch={handleSearch}
                pagination={users.meta}
                actions={
                    <>
                        <select
                            value={filters.role || ''}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="bg-admin-bg border-1.5 border-store-border rounded-xl px-4 py-2.5 text-xs font-bold text-store-charcoal outline-none focus:border-store-charcoal transition-all"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                        </select>

                        <Button
                            variant="dark"
                            size="md"
                            onClick={openCreateModal}
                            icon={PlusIcon}
                        >
                            Tambah User
                        </Button>
                    </>
                }
                headers={[
                    { label: 'Pengguna', className: 'w-[42%] lg:w-[32%]' },
                    { label: 'Kontak', className: 'hidden md:table-cell w-[26%]' },
                    { label: 'Member', className: 'hidden lg:table-cell w-[18%]' },
                    { label: 'Role', className: 'w-[18%] lg:w-[12%]' },
                    { label: 'Aksi', className: 'w-[22%] lg:w-[12%] text-right' },
                ]}
            >
                {users.data.map((user) => (
                    <tr key={user.id}>
                        <td>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-admin-bg flex items-center justify-center font-black text-store-muted border border-store-border">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-store-charcoal text-sm">{user.name}</span>
                                    <span className="text-[10px] text-store-subtle uppercase font-bold tracking-wider">{user.created_at}</span>
                                </div>
                            </div>
                        </td>
                        <td className="hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-store-charcoal">{user.email}</span>
                                <span className="text-[10px] font-bold text-store-subtle">{user.phone_number || '-'}</span>
                            </div>
                        </td>
                        <td className="hidden lg:table-cell">
                            {user.role === 'member' ? (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black text-store-charcoal">{user.balance_formatted}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-store-subtle">
                                        {user.member_tier_label}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-store-subtle">—</span>
                            )}
                        </td>
                        <td>
                            <Badge variant={user.role === 'admin' ? 'charcoal' : 'gray'}>
                                {user.role}
                            </Badge>
                        </td>
                        <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={route('admin.users.show', user.id)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                    title="Lihat Detail"
                                >
                                    <EyeIcon size={16} />
                                </Link>
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="p-2 rounded-lg bg-admin-bg text-store-muted hover:text-store-charcoal hover:bg-store-border transition-all"
                                    title="Edit User"
                                >
                                    <EditIcon size={16} />
                                </button>
                                {user.permissions.can_delete && (
                                    <button
                                        onClick={() => openDeleteModal(user)}
                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={user.id === auth.user.id}
                                        title={user.id === auth.user.id ? 'Anda tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            {/* Create Modal */}
            <Modal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tambah Pengguna Baru"
                onSubmit={submitCreate}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitCreate} loading={processing}>Simpan User</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Lengkap" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} placeholder="Contoh: John Doe" />
                    <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="john@example.com" />
                    <Input label="Nomor HP" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} error={errors.phone_number} placeholder="62812..." />
                    <Select label="Role Akses" value={data.role} onChange={e => setData('role', e.target.value)} error={errors.role}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </Select>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} />
                        <Input label="Konfirmasi" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                    </div>
                    {data.role === 'member' && (
                        <div className="space-y-4 rounded-2xl border border-dashed border-store-border bg-admin-bg/50 p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-store-subtle">Dompet &amp; paket member</p>
                            <Select label="Level paket" value={data.member_tier} onChange={e => setData('member_tier', e.target.value)} error={errors.member_tier}>
                                <option value="standard">Member (standar)</option>
                                <option value="reseller">Reseller</option>
                                <option value="vip">VIP</option>
                            </Select>
                            <Input
                                label="Saldo awal (Rp)"
                                type="number"
                                min={0}
                                step={1000}
                                value={data.balance}
                                onChange={e => setData('balance', e.target.value)}
                                error={errors.balance}
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profil Pengguna"
                onSubmit={submitEdit}
                footer={
                    <div className="flex justify-end gap-3 font-sans">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                        <Button variant="dark" onClick={submitEdit} loading={processing}>Simpan Perubahan</Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input label="Nama Lengkap" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                    <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />
                    <Input label="Nomor HP" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} error={errors.phone_number} />
                    <Select label="Role Akses" value={data.role} onChange={e => setData('role', e.target.value)} error={errors.role}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </Select>
                    {data.role === 'member' && (
                        <div className="space-y-4 rounded-2xl border border-dashed border-store-border bg-admin-bg/50 p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-store-subtle">Dompet &amp; paket member</p>
                            <Select label="Level paket" value={data.member_tier} onChange={e => setData('member_tier', e.target.value)} error={errors.member_tier}>
                                <option value="standard">Member (standar)</option>
                                <option value="reseller">Reseller</option>
                                <option value="vip">VIP</option>
                            </Select>
                            <Input
                                label="Saldo dompet (Rp)"
                                type="number"
                                min={0}
                                step={1000}
                                value={data.balance}
                                onChange={e => setData('balance', e.target.value)}
                                error={errors.balance}
                                placeholder="Kosongkan jika tidak diubah"
                            />
                            <p className="text-[10px] font-medium leading-relaxed text-store-subtle">
                                Hanya untuk akun member. Ubah saldo hanya bila perlu (mis. koreksi manual); transaksi top up member tetap lewat gateway.
                            </p>
                        </div>
                    )}
                    <div className="p-5 bg-admin-bg rounded-2xl border border-dashed border-store-border">
                        <p className="text-[10px] font-black text-store-subtle uppercase tracking-widest mb-4">Ubah Password (Optional)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Password Baru" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} />
                            <Input label="Konfirmasi" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmModal
                show={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                processing={processingDelete}
                title="Hapus Pengguna"
                message={`Apakah Anda yakin ingin menghapus akun "${selectedUser?.name}"? Tindakan ini akan mencabut seluruh akses pengguna ini ke sistem.`}
            />
        </AdminLayout>
    );
}
