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

            <div className="min-h-screen bg-store-dark flex font-sans text-[15px] leading-normal text-white/90 antialiased relative overflow-hidden">
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
                            <span className="text-xs font-semibold tracking-wide text-white/70">Layanan game 24 jam</span>
                        </div>
                        <h1 className="font-bebas text-5xl sm:text-6xl font-bold text-white leading-[0.95] mb-5 uppercase tracking-tight text-glow-accent">
                            Level up your<br />
                            <span className="text-gradient-accent">Gaming gears</span>
                        </h1>
                        <p className="text-base leading-relaxed max-w-md text-white/60 font-normal">
                            Masuk ke akun {siteName} untuk area member, pesanan, top up, dan upgrade paket.
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
                        <p className="text-sm font-medium text-white/45">
                            Bergabung dengan <span className="font-semibold text-white/80">10K+</span> gamer aktif
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
                            <h2 className="font-bebas text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-2">
                                Selamat datang kembali
                            </h2>
                            <p className="text-sm text-white/55 font-normal">Silakan masuk dengan email dan kata sandi Anda.</p>
                        </div>

                        {status && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-sm font-medium text-green-300 flex items-center gap-3">
                                <AppIcons.success_circle size={18} />
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block px-1 text-sm font-semibold text-white/65">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.mail size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.email ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 placeholder:font-normal transition-all outline-none`}
                                        placeholder="nama@email.com"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>
                                {errors.email && <p className="px-1 text-xs font-medium text-red-400">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block px-1 text-sm font-semibold text-white/65">Kata sandi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.password ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 transition-all outline-none`}
                                        placeholder="Kata sandi Anda"
                                        autoComplete="current-password"
                                    />
                                </div>
                                {errors.password && <p className="px-1 text-xs font-medium text-red-400">{errors.password}</p>}
                            </div>

                            {/* Remember me */}
                            <label className="flex items-center gap-3 p-1 cursor-pointer group w-fit">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 rounded-lg bg-white/5 border-2 border-white/10 text-store-accent focus:ring-store-accent focus:ring-offset-store-dark transition-all"
                                />
                                <span className="text-sm font-medium text-white/50 group-hover:text-white/75 transition-colors">
                                    Ingat saya di perangkat ini
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-store-accent hover:bg-amber-300 text-store-dark text-sm font-bold tracking-wide py-4 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="dark" /> Memproses…</>
                                ) : (
                                    <>
                                        Masuk
                                        <AppIcons.arrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5">
                            <p className="text-center text-sm font-normal text-white/45 leading-relaxed">
                                Belum punya akun?{' '}
                                <Link href={route('register')} className="font-semibold text-store-accent hover:text-amber-200">
                                    Daftar sebagai member
                                </Link>
                            </p>
                            <div className="mt-5 flex justify-center">
                                <Link href="/" className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
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
