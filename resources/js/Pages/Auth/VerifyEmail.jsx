import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Spinner from '@/Components/ui/Spinner';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-store-dark flex font-sans relative overflow-hidden">
            <Head title="Verifikasi Identitas — Mall Store" />

            {/* ── Decorative Background ── */}
            <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-store-accent/10 rounded-full blur-[120px] pointer-events-none" />

            {/* ── Left Panel (branding) ── */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
                <AppLogo theme="light" size="lg" href="/" />

                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <AppIcons.mail size={14} className="text-store-accent" />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Awaiting Link Validation</span>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-[0.9] mb-6 font-bebas uppercase tracking-tighter text-glow-accent">
                        Finalize your<br />
                        <span className="text-gradient-accent">Account Setup</span>
                    </h1>
                    <p className="text-store-subtle text-lg leading-relaxed max-w-md font-medium">
                        Terima kasih telah bergabung! Sebelum memulai petualangan di Mall Store, silakan verifikasi alamat email Anda melalui tautan yang baru saja kami kirimkan.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-white/20 uppercase tracking-widest font-black text-[10px]">
                    <AppIcons.shield size={16} />
                    Verified Identity Required
                </div>
            </div>

            {/* ── Right Panel (form) ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-store-dark/40 backdrop-blur-sm border-l border-white/5">
                <div className="w-full max-w-md space-y-10">
                    <div className="lg:hidden mb-12 flex justify-center">
                        <AppLogo size="lg" href="/" theme="light" />
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-white font-bebas uppercase tracking-tight mb-2">Verifikasi Email</h2>
                        <p className="text-sm text-store-subtle font-medium uppercase tracking-wider">Langkah terakhir menuju akses penuh</p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-sm font-bold text-green-400 flex items-center gap-3 animate-fade-in">
                            <AppIcons.success_circle size={18} />
                            Tautan verifikasi baru telah dikirim ke alamat email Anda.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-store-accent hover:bg-white text-store-dark font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <><Spinner size="sm" color="dark" /> Mengirim Ulang...</>
                            ) : (
                                <>
                                    Kirim Ulang Email Verifikasi
                                    <AppIcons.mail size={18} strokeWidth={3} className="group-hover:-translate-y-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-[10px] font-black text-red-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                <AppIcons.delete size={14} /> Keluar Akun
                            </Link>

                            <Link href="/" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-store-accent transition-colors">
                                ← Kembali ke Beranda
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
