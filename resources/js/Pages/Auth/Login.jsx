import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import Spinner from '@/Components/ui/Spinner';

export default function Login({ status, canResetPassword }) {
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
            <Head title="Masuk — Mall Store" />

            <div className="min-h-screen bg-store-bg flex font-sans">
                {/* ── Left Panel (branding) ── */}
                <div className="hidden lg:flex flex-1 flex-col justify-between bg-store-dark p-10 relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-store-accent/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-admin-accent/10 rounded-full blur-3xl" />

                    <AppLogo theme="light" size="lg" href="/" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-white/80">Proses instan 24/7</span>
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight mb-4">
                            Top-up game<br />
                            <span className="text-gradient-yellow">cepat & aman</span>
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Bergabung dengan ribuan gamer yang sudah mempercayai Mall Store untuk kebutuhan top-up mereka.
                        </p>
                    </div>

                    {/* Testimonial */}
                    <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                            "Prosesnya kilat banget, nggak pernah lemot! Recommended banget buat yang mau top-up."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-store-accent text-store-dark flex items-center justify-center font-black text-sm">A</div>
                            <div>
                                <p className="text-xs font-bold text-white">Ahmad R.</p>
                                <p className="text-[11px] text-gray-500">Member sejak 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel (form) ── */}
                <div className="flex-1 flex items-center justify-center p-6 lg:max-w-md lg:min-w-[420px]">
                    <div className="w-full max-w-sm">
                        {/* Mobile logo */}
                        <div className="lg:hidden mb-8 text-center">
                            <AppLogo size="lg" href="/" className="justify-center" />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-store-dark mb-1">Selamat Datang</h2>
                            <p className="text-sm text-store-muted">Masuk untuk melanjutkan ke akun Anda</p>
                        </div>

                        {status && (
                            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="input-label">Alamat Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`input-field ${errors.email ? 'is-error' : ''}`}
                                    placeholder="nama@email.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="input-label !mb-0">Kata Sandi</label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-xs font-semibold text-store-muted hover:text-store-dark transition-colors">
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`input-field ${errors.password ? 'is-error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                            </div>

                            {/* Remember me */}
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="checkbox-field"
                                />
                                <span className="text-sm font-medium text-store-muted group-hover:text-store-body transition-colors">
                                    Ingat saya
                                </span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full py-3 text-sm"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="gray" /> Memproses...</>
                                ) : (
                                    'Masuk Sekarang'
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-store-muted">
                            Belum punya akun?{' '}
                            <Link href={route('register')} className="font-bold text-store-dark hover:text-admin-accent transition-colors">
                                Daftar gratis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
