import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/ui/Badge';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function PaymentMethodShow({ paymentMethod }) {
    const methodData = paymentMethod;

    const BackIcon = AppIcons.chevronLeft;
    const WalletIcon = AppIcons.payments;
    const InfoIcon = AppIcons.info;
    const ShieldIcon = AppIcons.shield;

    return (
        <AdminLayout
            title="Detail Metode Pembayaran"
            subtitle={`Konfigurasi gateway: ${methodData?.name}`}
        >
            <Head title={`Payment Detail - ${methodData?.name}`} />

            <div className="mb-8">
                <Link
                    href={route('admin.payment-methods.index')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-store-muted hover:text-store-charcoal transition-colors px-4 py-2 bg-white rounded-xl border border-store-border shadow-soft"
                >
                    <BackIcon size={14} /> Kembali ke Daftar
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    {/* Brand Card */}
                    <div className="admin-content-card p-8 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-admin-bg border border-store-border mx-auto flex items-center justify-center p-4 mb-6 shadow-soft overflow-hidden">
                            <img src={methodData.image_url} alt={methodData.name} className="max-h-full object-contain" />
                        </div>
                        <h3 className="text-xl font-black text-store-charcoal tracking-tight">{methodData.name}</h3>
                        <p className="text-[10px] text-store-subtle uppercase font-bold tracking-widest mt-1">CODE: {methodData.code}</p>

                        <div className="mt-6">
                            <Badge variant={methodData.is_active ? 'accent' : 'gray'} className="px-6 py-1.5 text-[10px]">
                                {methodData.is_active ? 'Status: Aktif' : 'Status: Non-aktif'}
                            </Badge>
                        </div>
                    </div>

                    {/* Fees Card */}
                    <div className="admin-content-card p-6 bg-store-charcoal text-white">
                        <h4 className="text-[10px] font-black text-store-muted uppercase tracking-[0.2em] mb-6">Konfigurasi Biaya</h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-store-charcoal-light rounded-2xl border border-store-border-dark flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-store-muted uppercase">Fixed Fee</span>
                                    <span className="text-lg font-black">Rp {methodData.fee_flat.toLocaleString()}</span>
                                </div>
                                <WalletIcon size={24} className="text-store-accent opacity-20" />
                            </div>
                            <div className="p-4 bg-store-charcoal-light rounded-2xl border border-store-border-dark flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-store-muted uppercase">Percentage Fee</span>
                                    <span className="text-lg font-black">{methodData.fee_percent}%</span>
                                </div>
                                <InfoIcon size={24} className="text-store-accent opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="admin-content-card h-full">
                        <div className="px-8 py-6 border-b border-store-border flex items-center justify-between">
                            <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight">Informasi Gateway & Keamanan</h3>
                            <ShieldIcon className="text-green-500" size={20} />
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-store-muted uppercase tracking-widest block">Metode Integrasi</span>
                                    <div className="p-4 bg-admin-bg rounded-xl border border-store-border flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-black text-store-charcoal font-mono uppercase">Payment Gateway (API)</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-store-muted uppercase tracking-widest block">Verifikasi Pembayaran</span>
                                    <div className="p-4 bg-admin-bg rounded-xl border border-store-border">
                                        <span className="text-sm font-black text-store-charcoal">Otomatis (Callback)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-store-border border-dashed">
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-soft text-blue-600 shrink-0">
                                        <InfoIcon size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-blue-900 uppercase tracking-tight mb-1">Informasi Penarikan</h5>
                                        <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                            Biaya transaksi akan langsung ditambahkan ke total pembayaran pelanggan di landing page. Pastikan konfigurasi fee sesuai dengan kontrak Anda dengan provider Payment Gateway.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-admin-bg rounded-xl border border-store-border">
                                    <span className="text-[9px] font-bold text-store-subtle uppercase block mb-1">Terdaftar Sejak</span>
                                    <span className="text-xs font-black text-store-charcoal">{methodData.created_at}</span>
                                </div>
                                <div className="p-4 bg-admin-bg rounded-xl border border-store-border">
                                    <span className="text-[9px] font-bold text-store-subtle uppercase block mb-1">Status Keamanan</span>
                                    <span className="text-xs font-black text-green-600">Terverifikasi SSL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
