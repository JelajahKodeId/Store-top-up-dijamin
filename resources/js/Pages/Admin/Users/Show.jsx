import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

const STATUS_CONFIG = {
    success: { label: 'Berhasil', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    paid: { label: 'Dibayar', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    unpaid: { label: 'Belum Bayar', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    failed: { label: 'Gagal', color: 'text-red-600 bg-red-50 border-red-200' },
    canceled: { label: 'Dibatalkan', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const TX_STATUS = {
    pending: { label: 'Menunggu', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    success: { label: 'Berhasil', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    failed: { label: 'Gagal', color: 'text-red-700 bg-red-50 border-red-200' },
    cancelled: { label: 'Dibatalkan', color: 'text-slate-600 bg-slate-50 border-slate-200' },
    canceled: { label: 'Dibatalkan', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

function statusPill(map, status) {
    const cfg = map[status] ?? { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${cfg.color}`}>
            {cfg.label}
        </span>
    );
}

export default function UserShow({ user, recentOrders = [], walletTopups = [], tierUpgrades = [] }) {
    const u = user.data || user;

    const BackIcon = AppIcons.chevronLeft;
    const MailIcon = AppIcons.mail;
    const PhoneIcon = AppIcons.phone;
    const CalendarIcon = AppIcons.clock;
    const ShieldIcon = AppIcons.shield;
    const WalletIcon = AppIcons.wallet;

    const isMember = u.role === 'member';

    return (
        <AdminLayout title="Detail Pengguna" subtitle={`Informasi lengkap akun: ${u?.name}`}>
            <Head title={`Detail User - ${u?.name}`} />

            <div className="mb-8">
                <Link
                    href={route('admin.users.index')}
                    className="inline-flex items-center gap-2 rounded-xl border border-store-border bg-white px-4 py-2 text-xs font-bold text-store-muted shadow-soft transition-colors hover:text-store-charcoal"
                >
                    <BackIcon size={14} /> Kembali ke Daftar
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-1">
                    <div className="admin-content-card group p-8 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-white bg-admin-bg text-4xl font-black text-store-muted shadow-lux transition-transform duration-500 group-hover:scale-105">
                            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-store-charcoal">{u?.name}</h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-store-subtle">ID: #{u?.id}</p>

                        <div className="mt-6">
                            <Badge variant={u.role === 'admin' ? 'charcoal' : 'gray'} className="px-6 py-1.5 text-[10px]">
                                {u.role}
                            </Badge>
                        </div>
                    </div>

                    {isMember && (
                        <div className="admin-content-card p-6">
                            <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-store-muted">
                                <WalletIcon size={16} className="text-store-subtle" />
                                Dompet &amp; paket
                            </h4>
                            <div className="space-y-3 rounded-2xl border border-store-border bg-admin-bg/40 p-4 text-left">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-store-subtle">Saldo</span>
                                    <p className="text-lg font-black text-store-charcoal">{u.balance_formatted}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-store-subtle">Level</span>
                                    <p className="text-sm font-black text-store-charcoal">{u.member_tier_label}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="admin-content-card space-y-4 p-6">
                        <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-store-muted">Informasi Kontak</h4>

                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-store-muted">
                                <MailIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-store-subtle">Email</span>
                                <span className="text-sm font-black text-store-charcoal">{u.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-store-muted">
                                <PhoneIcon size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-store-subtle">Nomor HP</span>
                                <span className="text-sm font-black text-store-charcoal">{u.phone_number || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 lg:col-span-2">
                    <div className="admin-content-card overflow-hidden">
                        <div className="border-b border-store-border px-8 py-6">
                            <h3 className="text-base font-black uppercase tracking-tight text-store-charcoal">Detail Akun</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">
                            <div className="group relative overflow-hidden rounded-2xl border border-store-border bg-admin-bg p-6">
                                <CalendarIcon size={40} className="absolute -bottom-4 -right-4 text-store-charcoal/[0.03] transition-transform duration-500 group-hover:scale-110" />
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-store-subtle">
                                    Terdaftar Sejak
                                </span>
                                <span className="text-lg font-black text-store-charcoal">{u.created_at}</span>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl border border-store-border bg-admin-bg p-6">
                                <ShieldIcon size={40} className="absolute -bottom-4 -right-4 text-store-charcoal/[0.03] transition-transform duration-500 group-hover:scale-110" />
                                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-store-subtle">Status Keamanan</span>
                                <span className="text-lg font-black text-green-600">Terverifikasi</span>
                            </div>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="flex items-start gap-4 rounded-2xl border border-yellow-100 bg-yellow-50 p-6">
                                <div className="rounded-xl bg-white p-3 text-yellow-600 shadow-soft">
                                    <AppIcons.info size={20} />
                                </div>
                                <div>
                                    <h5 className="mb-1 text-sm font-black uppercase tracking-tight text-yellow-800">Catatan Akun</h5>
                                    <p className="text-xs font-medium leading-relaxed text-yellow-700">
                                        Pengguna ini berperan sebagai <strong>{u.role}</strong>.
                                        {isMember &&
                                            ' Saldo dan level paket dapat disesuaikan dari menu Edit pada daftar pengguna bila diperlukan (koreksi manual).'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-content-card overflow-hidden">
                        <div className="flex flex-col gap-1 border-b border-store-border px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-base font-black uppercase tracking-tight text-store-charcoal">Riwayat Pesanan</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-store-subtle">
                                Email ini atau checkout login sebagai member
                            </span>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="divide-y divide-store-border">
                                {recentOrders.map((order) => (
                                    <div key={order.invoice_code} className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-mono text-xs font-black text-store-charcoal">{order.invoice_code}</span>
                                            <span className="text-[10px] text-store-subtle">{order.created_at}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-store-charcoal">{order.total_price_formatted}</span>
                                            {statusPill(STATUS_CONFIG, order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-admin-bg shadow-soft">
                                    <AppIcons.orders size={20} className="text-store-subtle" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-tight text-store-charcoal">Belum Ada Pesanan</h4>
                                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-store-subtle">Tidak ada order terkait</p>
                            </div>
                        )}
                    </div>

                    {isMember && (
                        <>
                            <div className="admin-content-card overflow-hidden">
                                <div className="border-b border-store-border px-8 py-5">
                                    <h3 className="text-base font-black uppercase tracking-tight text-store-charcoal">Top Up Saldo</h3>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-store-subtle">
                                        Riwayat permintaan top up dompet member
                                    </p>
                                </div>
                                {walletTopups.length > 0 ? (
                                    <div className="divide-y divide-store-border">
                                        {walletTopups.map((row) => (
                                            <div key={row.invoice_code} className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-mono text-xs font-black text-store-charcoal">{row.invoice_code}</span>
                                                    <span className="text-[10px] text-store-subtle">{row.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-store-charcoal">{row.amount_formatted}</span>
                                                    {statusPill(TX_STATUS, row.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-xs font-bold text-store-subtle">Belum ada riwayat top up.</div>
                                )}
                            </div>

                            <div className="admin-content-card overflow-hidden">
                                <div className="border-b border-store-border px-8 py-5">
                                    <h3 className="text-base font-black uppercase tracking-tight text-store-charcoal">Upgrade Paket</h3>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-store-subtle">
                                        Pembayaran upgrade Reseller / VIP
                                    </p>
                                </div>
                                {tierUpgrades.length > 0 ? (
                                    <div className="divide-y divide-store-border">
                                        {tierUpgrades.map((row) => (
                                            <div key={row.invoice_code} className="flex flex-wrap items-center justify-between gap-4 px-8 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-black text-store-charcoal">{row.target_label}</span>
                                                    <span className="font-mono text-[10px] text-store-subtle">{row.invoice_code}</span>
                                                    <span className="text-[10px] text-store-subtle">{row.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-store-charcoal">{row.amount_formatted}</span>
                                                    {statusPill(TX_STATUS, row.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-xs font-bold text-store-subtle">Belum ada riwayat upgrade paket.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
