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
        <>
            <Head title="Lacak Pesanan — Mall Store" />

            <div className="section-container pb-12 sm:pb-16">
                <div className="mx-auto max-w-xl space-y-4">

                    {/* ── Search Card ──────────────────────────────────── */}
                    <div className="relative overflow-hidden rounded-2xl border border-guest-border bg-guest-surface p-5 shadow-soft sm:p-6 md:p-7">
                        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-store-accent/10 blur-[60px]" />
                        <div className="relative z-10">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-store-accent/25 bg-store-accent/10">
                                    <AppIcons.search size={21} strokeWidth={2.5} className="text-store-accent" />
                                </div>
                                <div>
                                    <h2 className="font-bebas text-2xl font-bold uppercase tracking-wide text-guest-text">
                                        Lacak Pesanan
                                    </h2>
                                    <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-guest-subtle">
                                        Masukkan nomor invoice untuk melihat status
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-4">
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
                                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-store-accent py-4 text-[11px] font-black uppercase tracking-[0.15em] text-store-dark shadow-accent-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {processing ? (
                                        <>
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Mencari...
                                        </>
                                    ) : (
                                        <>
                                            Lacak Sekarang
                                            <AppIcons.arrowRight
                                                size={15}
                                                strokeWidth={3}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-5 flex items-center justify-between border-t border-guest-border pt-4 sm:mt-6 sm:pt-5">
                                <div className="space-y-0.5">
                                    <span className="block text-[11px] font-bold uppercase tracking-wide text-guest-subtle">
                                        Metode Cek
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-guest-text">
                                        <AppIcons.speed size={11} className="text-store-accent" /> Otomatis
                                    </span>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <span className="block text-[11px] font-bold uppercase tracking-wide text-guest-subtle">
                                        Update Terakhir
                                    </span>
                                    <span className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase text-green-700">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                        Sistem Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Invoice tidak ditemukan ───────────────────────── */}
                    {not_found && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-guest-border bg-guest-surface p-5 text-center shadow-soft duration-500 sm:p-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
                                <AppIcons.help size={26} strokeWidth={2} />
                            </div>
                            <h3 className="mb-1 font-bebas text-xl font-bold uppercase tracking-wide text-guest-text">
                                Invoice Tidak Ditemukan
                            </h3>
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-guest-subtle">
                                Tidak ada pesanan dengan invoice
                            </p>
                            <p className="font-mono text-sm font-bold text-guest-muted">{search_invoice}</p>
                            <p className="mt-2 text-xs font-medium leading-normal text-guest-muted">
                                Pastikan nomor invoice yang dimasukkan benar dan lengkap.
                            </p>
                        </div>
                    )}

                    {/* ── Help ─────────────────────────────────────────── */}
                    <a
                        href={csWaLink ?? 'https://wa.me/62'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-3 rounded-3xl border border-guest-border bg-guest-surface p-5 shadow-soft transition-all hover:border-store-accent/30 hover:bg-guest-elevated"
                    >
                        <AppIcons.help
                            size={16}
                            className="text-store-accent transition-transform group-hover:scale-110"
                        />
                        <p className="text-center text-xs font-semibold uppercase tracking-wide text-guest-subtle sm:text-sm">
                            Butuh bantuan?{' '}
                            <span className="text-guest-muted underline transition-colors group-hover:text-store-accent">
                                Hubungi Customer Service
                            </span>{' '}
                            kami via WhatsApp.
                        </p>
                    </a>

                </div>
            </div>
        </>
    );
}
