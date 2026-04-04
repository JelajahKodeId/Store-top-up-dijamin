import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import Button from '@/Components/ui/Button';
import GuestInput from '@/Components/guest/GuestInput';

export default function TrackInvoice() {
    const { data, setData, get, processing, errors } = useForm({
        invoice: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('landing.track.search'));
    };

    return (
        <GuestLayout title="Lacak Pesanan" subtitle="Periksa status transaksi Anda secara real-time">
            <Head title="Lacak Pesanan — Mall Store" />

            <div className="section-container pb-40">
                <div className="max-w-2xl mx-auto">
                    <div className="p-8 md:p-12 rounded-[3.5rem] bg-store-charcoal-light/50 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-store-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-store-accent/10 transition-all duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 rounded-3xl bg-store-accent/10 border border-store-accent/20 flex items-center justify-center text-store-accent">
                                    <AppIcons.search size={32} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 className="section-heading">Cari Invoice</h2>
                                    <p className="section-subtext text-[10px] mt-1">Masukkan nomor invoice untuk melihat status</p>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-8">
                                <GuestInput
                                    label="Nomor Invoice"
                                    icon="globe"
                                    type="text"
                                    placeholder="INVXXXXXXXXXX"
                                    value={data.invoice}
                                    onChange={(e) => setData('invoice', e.target.value)}
                                    error={errors.invoice}
                                />

                                <Button
                                    disabled={processing}
                                    variant="accent"
                                    className="w-full py-6 rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] shadow-accent-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group/btn"
                                >
                                    {processing ? 'Searching...' : 'Lacak Sekarang'}
                                    <AppIcons.arrowRight size={24} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                                </Button>
                            </form>

                            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Metode Cek</span>
                                    <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
                                        <AppIcons.zap size={14} className="text-store-accent" /> Real-time
                                    </span>
                                </div>
                                <div className="space-y-2 text-right">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Update Terakhir</span>
                                    <span className="text-sm font-bold text-white uppercase">Sistem Aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 justify-center">
                        <AppIcons.help size={20} className="text-store-accent" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            Butuh bantuan? Silakan hubungi <span className="text-white/60 hover:text-store-accent cursor-pointer transition-colors underline">Customer Service</span> kami.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
