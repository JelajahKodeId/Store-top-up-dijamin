import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import Spinner from '@/Components/ui/Spinner';

export default function Register() {
    const { site } = usePage().props;
    const siteName = site?.name || 'Mall Store';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <>
            <Head title={`Daftar — ${siteName}`} />

            <div className="min-h-screen bg-store-dark flex font-sans text-[15px] leading-normal text-white/90 antialiased relative overflow-hidden">
                {/* ── Decorative Background ── */}
                <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-store-accent/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* ── Left Panel (branding) ── */}
                <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
                    <AppLogo theme="light" size="lg" href="/" />

                    <div className="max-w-xl">
                        <h1 className="font-bebas text-5xl sm:text-6xl font-bold text-white leading-[0.95] mb-6 uppercase tracking-tight text-glow-accent">
                            Join the<br />
                            <span className="text-gradient-purple">Elite ranks</span>
                        </h1>
                        <p className="text-base leading-relaxed max-w-md text-white/60 font-normal mb-10">
                            Daftar gratis untuk akun member: lacak pesanan, top up saldo, dan upgrade paket Reseller atau VIP.
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
                                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">{f.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative z-10 text-xs font-normal text-white/35 leading-relaxed max-w-sm">
                        Dengan mendaftar, Anda menyetujui syarat ketentuan dan kebijakan privasi {siteName}.
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
                            <h2 className="font-bebas text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-2">Buat akun baru</h2>
                            <p className="text-sm text-white/55 font-normal">Lengkapi data di bawah — gunakan nomor WhatsApp aktif.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="block px-1 text-sm font-semibold text-white/65">Nama lengkap</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.users size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.name ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 transition-all outline-none`}
                                        placeholder="Contoh: Akmal Ibrasa"
                                        autoComplete="name"
                                        autoFocus
                                    />
                                </div>
                                {errors.name && <p className="px-1 text-xs font-medium text-red-400">{errors.name}</p>}
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-2">
                                <label className="block px-1 text-sm font-semibold text-white/65">Nomor WhatsApp</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.phone size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.phone_number ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 transition-all outline-none`}
                                        placeholder="6281234567890"
                                        autoComplete="tel"
                                    />
                                </div>
                                {errors.phone_number && (
                                    <p className="px-1 text-xs font-medium text-red-400">{errors.phone_number}</p>
                                )}
                            </div>

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
                                        className={`w-full bg-white/5 border-2 ${errors.email ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 transition-all outline-none`}
                                        placeholder="nama@email.com"
                                        autoComplete="email"
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
                                        placeholder="Minimal 8 karakter"
                                        autoComplete="new-password"
                                    />
                                </div>
                                {errors.password && <p className="px-1 text-xs font-medium text-red-400">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="block px-1 text-sm font-semibold text-white/65">Ulangi kata sandi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/25 group-focus-within:text-store-accent transition-colors">
                                        <AppIcons.check size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`w-full bg-white/5 border-2 ${errors.password_confirmation ? 'border-red-500/50' : 'border-white/5'} focus:border-store-accent rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-normal text-white placeholder:text-white/25 transition-all outline-none`}
                                        placeholder="Ulangi kata sandi"
                                        autoComplete="new-password"
                                    />
                                </div>
                                {errors.password_confirmation && <p className="px-1 text-xs font-medium text-red-400">{errors.password_confirmation}</p>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-store-accent hover:bg-amber-300 text-store-dark text-sm font-bold tracking-wide py-4 rounded-2xl transition-all duration-300 shadow-accent-glow flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="dark" /> Mendaftar…</>
                                ) : (
                                    <>
                                        Daftar
                                        <AppIcons.plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5 text-center">
                            <p className="text-sm font-normal text-white/45">
                                Sudah punya akun?{' '}
                                <Link href={route('login')} className="font-semibold text-store-accent hover:text-amber-200 transition-colors">
                                    Masuk
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
