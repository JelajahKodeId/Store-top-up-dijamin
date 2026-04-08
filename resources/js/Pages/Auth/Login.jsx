import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Spinner from '@/Components/ui/Spinner';

export default function Login({ status }) {
    const { site } = usePage().props;
    const siteName = site?.name || 'Mall Store';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title={`Masuk — ${siteName}`} />

            <div className="min-h-screen bg-store-dark flex font-sans relative overflow-hidden">
                {/* ── Decorative Background ── */}
                <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-store-accent/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* ── Left Panel (branding) ── */}
                <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
                    <AppLogo theme="light" size="lg" href="/" />

                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-store-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-store-accent"></span>
                            </span>
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Elite Gaming Service 24/7</span>
                        </div>
                        <h1 className="text-6xl font-black text-white leading-[0.9] mb-6 font-bebas uppercase tracking-tighter text-glow-accent">
                            Level up your<br />
                            <span className="text-gradient-accent">Gaming gears</span>
                        </h1>
                        <p className="text-store-subtle text-lg leading-relaxed max-w-md font-medium">
                            Masuk ke portal premium {siteName} dan nikmati layanan top-up tercepat di industri gaming.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-store-dark bg-store-charcoal-light flex items-center justify-center text-[10px] font-black text-white uppercase overflow-hidden">
                                    <AppIcons.users size={16} />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            Bergabung dengan <span className="text-white">10K+</span> gamers aktif
                        </p>
                    </div>
                </div>

                {/* ── Right Panel (form) ── */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-store-dark/40 backdrop-blur-sm border-l border-white/5">
                    <div className="w-full max-w-md space-y-10">
                        {/* Mobile logo */}
                        <div className="lg:hidden mb-12 flex justify-center">
                            <AppLogo size="lg" href="/" theme="light" />
                        </div>

                        <div>
                            <h2 className="text-4xl font-black text-white font-bebas uppercase tracking-tight mb-2">Selamat Datang Kembali</h2>
                            <p className="text-sm text-store-subtle font-medium uppercase tracking-wider">Silahkan masuk ke akun anda</p>
                        </div>

                        {status && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-sm font-bold text-green-400 flex items-center gap-3">
                                <AppIcons.success_circle size={18} />
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Email Gamer</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.mail size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.email ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/10 transition-all outline-none`}
                                        placeholder="GAMER@CORE.COM"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Input Pass-code</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.password ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/10 transition-all outline-none`}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.password}</p>}
                            </div>

                            {/* Remember me */}
                            <label className="flex items-center gap-3 p-1 cursor-pointer group w-fit">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 rounded-lg bg-white/5 border-2 border-white/10 text-store-accent focus:ring-store-accent focus:ring-offset-store-dark transition-all"
                                />
                                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                                    Tetap aktif dalam sesi
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-store-accent hover:bg-white text-store-dark font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="dark" /> Mengunduh Data...</>
                                ) : (
                                    <>
                                        Masuk Akun Sekarang
                                        <AppIcons.arrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5">
                            <p className="text-center text-[10px] font-bold text-white/25 uppercase tracking-widest leading-relaxed">
                                Akses khusus pengelola toko. Pembelian tetap lewat katalog tanpa akun.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Link href="/" className="text-[10px] font-black text-store-accent uppercase tracking-widest hover:text-white transition-colors">
                                    ← Kembali ke beranda
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
