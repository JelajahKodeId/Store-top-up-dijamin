import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Spinner from '@/Components/ui/Spinner';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-store-dark flex font-sans relative overflow-hidden">
            <Head title="Reset Pass-code — Mall Store" />

            {/* ── Decorative Background ── */}
            <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-store-accent/10 rounded-full blur-[120px] pointer-events-none" />

            {/* ── Left Panel (branding) ── */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
                <AppLogo theme="light" size="lg" href="/" />

                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <AppIcons.shield size={14} className="text-store-accent" />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Override Protocol Active</span>
                    </div>
                    <h1 className="text-6xl font-black text-white leading-[0.9] mb-6 font-bebas uppercase tracking-tighter text-glow-accent">
                        Reset your<br />
                        <span className="text-gradient-accent">Access Key</span>
                    </h1>
                    <p className="text-store-subtle text-lg leading-relaxed max-w-md font-medium">
                        Waktunya mengamankan kembali akun Anda. Gunakan kombinasi yang kuat untuk memastikan keamanan maksimal di setiap transaksi.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-white/20 uppercase tracking-widest font-black text-[10px]">
                    <AppIcons.lock size={16} />
                    Secured by Mall Store Identity
                </div>
            </div>

            {/* ── Right Panel (form) ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-store-dark/40 backdrop-blur-sm border-l border-white/5">
                <div className="w-full max-w-md space-y-10">
                    <div className="lg:hidden mb-12 flex justify-center">
                        <AppLogo size="lg" href="/" theme="light" />
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-white font-bebas uppercase tracking-tight mb-2">Konfigurasi Pass-code</h2>
                        <p className="text-sm text-store-subtle font-medium uppercase tracking-wider">Silahkan masukkan kredensial baru</p>
                    </div>

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
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Pass-code Baru</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors">
                                    <AppIcons.lock size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`w-full bg-white/5 border-2 ${errors.password ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/10 transition-all outline-none`}
                                    placeholder="MIN. 8 KARAKTER"
                                    autoComplete="new-password"
                                    autoFocus
                                />
                            </div>
                            {errors.password && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Konfirmasi Pass-code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors">
                                    <AppIcons.check size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={`w-full bg-white/5 border-2 ${errors.password_confirmation ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/10 transition-all outline-none`}
                                    placeholder="ULANGI PASS-CODE"
                                    autoComplete="new-password"
                                />
                            </div>
                            {errors.password_confirmation && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-store-accent hover:bg-white text-store-dark font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <><Spinner size="sm" color="dark" /> Mengunduh Data...</>
                            ) : (
                                <>
                                    Simpan Kata Sandi Baru
                                    <AppIcons.arrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
