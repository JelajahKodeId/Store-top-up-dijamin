import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import AppLogo from '@/Components/shared/AppLogo';

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
        <div className="min-h-screen bg-store-surface flex flex-col md:flex-row">
            <Head title="Reset Kata Sandi" />

            {/* Left Column: Branding */}
            <div className="hidden md:flex md:w-1/3 lg:w-2/5 bg-store-dark relative overflow-hidden flex-col p-12">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/">
                        <AppLogo theme="dark" className="h-8 w-auto mb-20" />
                    </Link>

                    <div className="mt-auto">
                        <h2 className="text-3xl font-black text-white leading-tight mb-4">
                            Keamanan Akun Utama
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Gunakan kata sandi yang kuat dan unik untuk melindungi akun serta transaksi Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <div className="md:hidden flex justify-center mb-10">
                        <Link href="/">
                            <AppLogo theme="light" className="h-8 w-auto" />
                        </Link>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-2xl font-black text-store-dark mb-2">Reset Kata Sandi</h1>
                        <p className="text-sm text-store-muted leading-relaxed">
                            Silakan masukkan kata sandi baru Anda untuk memulihkan akses akun.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            label="Alamat Email"
                            value={data.email}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <Input
                            id="password"
                            type="password"
                            name="password"
                            label="Kata Sandi Baru"
                            value={data.password}
                            autoComplete="new-password"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            label="Konfirmasi Kata Sandi"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                        />

                        <div className="pt-4">
                            <Button className="w-full" disabled={processing} type="submit">
                                Simpan Kata Sandi Baru
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
