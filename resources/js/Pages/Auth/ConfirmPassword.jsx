import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import AppLogo from '@/Components/shared/AppLogo';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-store-surface flex flex-col md:flex-row">
            <Head title="Konfirmasi Kata Sandi" />

            {/* Left Column: Branding */}
            <div className="hidden md:flex md:w-1/3 lg:w-2/5 bg-store-dark relative overflow-hidden flex-col p-12">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/">
                        <AppLogo theme="dark" className="h-8 w-auto mb-20" />
                    </Link>

                    <div className="mt-auto">
                        <h2 className="text-3xl font-black text-white leading-tight mb-4">
                            Keamanan Akun Terjamin
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Beberapa fitur memerlukan konfirmasi kata sandi untuk memastikan hanya Anda yang memiliki akses penuh ke akun ini.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <div className="md:hidden flex justify-center mb-10">
                        <Link href="/">
                            <AppLogo theme="light" className="h-8 w-auto" />
                        </Link>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-2xl font-black text-store-dark mb-2">Konfirmasi Sandi</h1>
                        <p className="text-sm text-store-muted leading-relaxed">
                            Ini adalah area aman. Silakan konfirmasi kata sandi Anda sebelum melanjutkan ke halaman yang Anda tuju.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            label="Kata Sandi Anda"
                            value={data.password}
                            placeholder="Ketik kata sandi Anda"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                        />

                        <div className="pt-2">
                            <Button className="w-full" disabled={processing} type="submit">
                                Konfirmasi & Lanjutkan
                            </Button>
                        </div>

                        <div className="text-center pt-8 border-t border-store-border">
                            <Link href="/" className="text-xs font-bold text-store-subtle hover:text-store-dark transition-colors">
                                ← Kembali ke Beranda
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
