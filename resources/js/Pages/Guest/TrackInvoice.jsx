import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { AppIcons } from '@/Components/shared/AppIcon';
import GuestInput from '@/Components/guest/GuestInput';
import { toWaLink } from '@/utils/guest';

export default function TrackInvoice({ not_found = false, search_invoice = '' }) {
    const { data, setData, get, processing, errors } = useForm({
        invoice: search_invoice || '',
    });

    const { site } = usePage().props;
    const csWaLink = site?.whatsapp ? toWaLink(site.whatsapp) : null;

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('landing.track.search'));
    };

    return (
        <GuestLayout title="Lacak Pesanan" subtitle="Periksa status transaksi Anda secara real-time">
            <Head title="Lacak Pesanan — Mall Store" />

            <div className="section-container pb-40">
                <div className="max-w-xl mx-auto space-y-5">

                    {/* ── Search Card ──────────────────────────────────── */}
                    <div className="p-8 md:p-10 rounded-3xl bg-store-charcoal-light/30 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-store-accent/5 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-11 h-11 rounded-2xl bg-store-accent/10 border border-store-accent/20 flex items-center justify-center flex-shrink-0">
                                    <AppIcons.search size={21} strokeWidth={2.5} className="text-store-accent" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white font-bebas tracking-wide uppercase">Lacak Pesanan</h2>
                                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                                        Masukkan nomor invoice untuk melihat status
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-5">
                                <GuestInput
                                    label="Nomor Invoice"
                                    icon="receipt"
                                    type="text"
                                    placeholder="INV-XXXXXXXXXXXX"
                                    value={data.invoice}
                                    onChange={(e) => setData('invoice', e.target.value.toUpperCase())}
                                    error={errors.invoice}
                                    autoCapitalize="characters"
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.invoice.trim()}
                                    className="w-full bg-store-accent hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-store-dark font-black uppercase tracking-[0.15em] py-4 rounded-xl transition-all shadow-accent-glow flex items-center justify-center gap-3 group text-[11px]"
                                >
                                    {processing ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Mencari...
                                        </>
                                    ) : (
                                        <>
                                            Lacak Sekarang
                                            <AppIcons.arrowRight size={15} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest block">Metode Cek</span>
                                    <span className="text-[11px] font-semibold text-white uppercase flex items-center gap-1.5">
                                        <AppIcons.speed size={11} className="text-store-accent" /> Otomatis
                                    </span>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest block">Update Terakhir</span>
                                    <span className="text-[11px] font-semibold text-green-400 uppercase flex items-center justify-end gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Sistem Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Invoice tidak ditemukan ───────────────────────── */}
                    {not_found && (
                        <div className="p-8 rounded-3xl bg-store-charcoal-light/30 border border-white/5 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
                                <AppIcons.help size={26} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold text-white font-bebas tracking-wide mb-1">Invoice Tidak Ditemukan</h3>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1">
                                Tidak ada pesanan dengan invoice
                            </p>
                            <p className="text-sm font-bold text-white/50 font-mono">{search_invoice}</p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-3">
                                Pastikan nomor invoice yang dimasukkan benar dan lengkap.
                            </p>
                        </div>
                    )}

                    {/* ── Help ─────────────────────────────────────────── */}
                    <a
                        href={csWaLink ?? 'https://wa.me/62'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-3 justify-center hover:bg-white/[0.04] hover:border-store-accent/20 transition-all group"
                    >
                        <AppIcons.help size={16} className="text-store-accent group-hover:scale-110 transition-transform" />
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center">
                            Butuh bantuan?{' '}
                            <span className="text-white/50 group-hover:text-store-accent transition-colors underline">
                                Hubungi Customer Service
                            </span>{' '}
                            kami via WhatsApp.
                        </p>
                    </a>

                </div>
            </div>
        </GuestLayout>
    );
}
