import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Spinner from '@/Components/ui/Spinner';
import Button from '@/Components/ui/Button';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <>
            <Head title="Daftar — Mall Store" />

            <div className="min-h-screen bg-store-dark flex font-sans relative overflow-hidden">
                {/* ── Decorative Background ── */}
                <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-store-accent/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* ── Left Panel (branding) ── */}
                <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
                    <AppLogo theme="light" size="lg" href="/" />

                    <div className="max-w-xl">
                        <h1 className="text-6xl font-black text-white leading-[0.9] mb-8 font-bebas uppercase tracking-tighter text-glow-accent">
                            Join the<br />
                            <span className="text-gradient-purple">Elite Ranks</span>
                        </h1>
                        <p className="text-store-subtle text-lg leading-relaxed max-w-md font-medium mb-12">
                            Daftar gratis dan dapatkan akses prioritas ke ribuan produk top-up game favorit Anda dengan harga kompetitif.
                        </p>

                        {/* Features */}
                        <div className="space-y-6">
                            {[
                                { icon: 'success', text: 'Proses instan dalam hitungan detik' },
                                { icon: 'shield', text: 'Sistem pembayaran aman & terenkripsi' },
                                { icon: 'categories', text: '100+ game tersedia di katalog kami' },
                                { icon: 'notification', text: 'Layanan aktif 24 jam 7 hari seminggu' },
                            ].map((f) => {
                                const Icon = AppIcons[f.icon];
                                return (
                                    <div key={f.text} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-store-accent group-hover:bg-store-accent group-hover:text-store-dark transition-all duration-300">
                                            <Icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-tight">{f.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative z-10 text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed max-w-xs">
                        Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi Mall Store.
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
                            <h2 className="text-4xl font-black text-white font-bebas uppercase tracking-tight mb-2">Buat Akun Baru</h2>
                            <p className="text-sm text-store-subtle font-medium uppercase tracking-wider">Bergabung dengan komunitas gamer kami</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.users size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.name ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/10 transition-all outline-none`}
                                        placeholder="NAMA LENGKAP"
                                        autoComplete="name"
                                        autoFocus
                                    />
                                </div>
                                {errors.name && <p className="px-1 text-[10px] font-black text-red-400 uppercase italic tracking-wider">{errors.name}</p>}
                            </div>

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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-store-accent hover:bg-white text-store-dark font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="dark" /> Mendaftarkan...</>
                                ) : (
                                    <>
                                        Daftar Sekarang
                                        <AppIcons.plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5 text-center">
                            <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
                                Sudah memiliki akses?{' '}
                                <Link href={route('login')} className="text-store-accent hover:text-white transition-colors">
                                    Masuk Disini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
