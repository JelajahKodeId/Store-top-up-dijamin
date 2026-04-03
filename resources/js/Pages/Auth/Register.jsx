import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import Spinner from '@/Components/ui/Spinner';

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

            <div className="min-h-screen bg-store-bg flex font-sans">
                {/* ── Left Panel (branding) ── */}
                <div className="hidden lg:flex flex-1 flex-col justify-between bg-store-dark p-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-store-accent/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-admin-accent/10 rounded-full blur-3xl" />

                    <AppLogo theme="light" size="lg" href="/" />

                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white leading-tight mb-4">
                            Bergabung &<br />
                            <span className="text-gradient-yellow">nikmati kemudahan</span>
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-8">
                            Daftar gratis dan dapatkan akses ke ribuan produk top-up game favorit Anda.
                        </p>

                        {/* Features */}
                        {[
                            { icon: '⚡', text: 'Proses instan dalam hitungan detik' },
                            { icon: '🔒', text: 'Sistem pembayaran aman & terenkripsi' },
                            { icon: '🎮', text: '100+ game tersedia di katalog kami' },
                            { icon: '🕐', text: 'Layanan aktif 24 jam 7 hari seminggu' },
                        ].map((f) => (
                            <div key={f.text} className="flex items-center gap-3 mb-3">
                                <span className="text-lg">{f.icon}</span>
                                <span className="text-sm text-gray-300">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 text-xs text-gray-600">
                        Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.
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
                            <h2 className="text-2xl font-black text-store-dark mb-1">Buat Akun Baru</h2>
                            <p className="text-sm text-store-muted">Gratis, cepat, dan mudah</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="input-label">Nama Lengkap</label>
                                <input
                                    type="text" value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`input-field ${errors.name ? 'is-error' : ''}`}
                                    placeholder="Nama Lengkap" autoComplete="name" autoFocus
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="input-label">Alamat Email</label>
                                <input
                                    type="email" value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`input-field ${errors.email ? 'is-error' : ''}`}
                                    placeholder="nama@email.com" autoComplete="email"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="input-label">Kata Sandi</label>
                                <input
                                    type="password" value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`input-field ${errors.password ? 'is-error' : ''}`}
                                    placeholder="Min. 8 karakter" autoComplete="new-password"
                                />
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="input-label">Konfirmasi Kata Sandi</label>
                                <input
                                    type="password" value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={`input-field ${errors.password_confirmation ? 'is-error' : ''}`}
                                    placeholder="Ulangi kata sandi" autoComplete="new-password"
                                />
                                {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full py-3 text-sm"
                            >
                                {processing ? (
                                    <><Spinner size="sm" color="gray" /> Mendaftar...</>
                                ) : (
                                    'Daftar Sekarang'
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-store-muted">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="font-bold text-store-dark hover:text-admin-accent transition-colors">
                                Masuk disini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
