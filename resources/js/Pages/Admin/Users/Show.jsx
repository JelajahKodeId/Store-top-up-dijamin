import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function UserShow({ user }) {
    // Destructure nested data from JsonResource
    const userData = user;

    const BackIcon = AppIcons.chevronLeft;
    const MailIcon = AppIcons.mail;
    const PhoneIcon = AppIcons.phone;
    const CalendarIcon = AppIcons.calendar || AppIcons.dashboard;
    const ShieldIcon = AppIcons.shield;

    return (
        <AdminLayout
            title="Detail Pengguna"
            subtitle={`Informasi lengkap akun: ${userData?.name}`}
        >
            <Head title={`Detail User - ${userData?.name}`} />

            <div className="mb-8">
                <Link
                    href={route('admin.users.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Kembali ke Daftar
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="admin-content-card p-8 text-center group">
                        <div className="w-24 h-24 rounded-3xl bg-admin-bg border-2 border-white shadow-lux mx-auto flex items-center justify-center text-4xl font-black text-store-muted mb-6 group-hover:scale-105 transition-transform duration-500">
                            {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <h3 className="text-xl font-black text-store-charcoal tracking-tight">{userData?.name}</h3>
                        <p className="text-xs font-bold text-store-subtle uppercase tracking-widest mt-1">ID: #{userData?.id}</p>

                        <div className="mt-6">
                            <Badge variant={userData.role === 'admin' ? 'charcoal' : 'gray'} className="px-6 py-1.5 text-[10px]">
                                {userData.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="admin-content-card p-6 space-y-4">
                        <h4 className="text-[11px] font-black text-store-muted uppercase tracking-[0.2em] mb-4">Informasi Kontak</h4>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-store-muted">
                                <MailIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider">Email</span>
                                <span className="text-sm font-black text-store-charcoal">{userData.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-store-muted">
                                <PhoneIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider">Nomor HP</span>
                                <span className="text-sm font-black text-store-charcoal">{userData.phone_number || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="admin-content-card overflow-hidden">
                        <div className="px-8 py-6 border-b border-store-border">
                            <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Detail Akun & Aktivitas</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8">
                            <div className="p-6 bg-admin-bg rounded-2xl border border-store-border relative group overflow-hidden">
                                <CalendarIcon size={40} className="absolute -right-4 -bottom-4 text-store-charcoal/[0.03] group-hover:scale-110 transition-transform duration-500" />
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-1">Terdaftar Sejak</span>
                                <span className="text-lg font-black text-store-charcoal">{user.created_at}</span>
                            </div>

                            <div className="p-6 bg-admin-bg rounded-2xl border border-store-border relative group overflow-hidden">
                                <ShieldIcon size={40} className="absolute -right-4 -bottom-4 text-store-charcoal/[0.03] group-hover:scale-110 transition-transform duration-500" />
                                <span className="text-[10px] font-bold text-store-subtle uppercase tracking-wider block mb-1">Status Keamanan</span>
                                <span className="text-lg font-black text-green-600">Terverifikasi</span>
                            </div>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-soft text-yellow-600">
                                    <AppIcons.info size={20} />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-yellow-800 uppercase tracking-tight mb-1">Catatan Akun</h5>
                                    <p className="text-xs text-yellow-700 font-medium leading-relaxed">
                                        Pengguna ini memiliki hak akses sebagai <strong>{user.role}</strong>. Pastikan setiap perubahan data profil sudah sesuai dengan permintaan pemilik akun untuk menjaga keamanan data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-content-card p-8">
                        <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight mb-6">Riwayat Transaksi Terakhir</h3>
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-soft">
                                <AppIcons.orders className="w-6 h-6 text-store-subtle" />
                            </div>
                            <h4 className="text-base font-black text-store-charcoal uppercase tracking-tight">Belum Ada Transaksi</h4>
                            <p className="text-xs text-store-subtle uppercase font-bold tracking-widest mt-1">Pengguna ini belum melakukan pesanan apa pun</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
