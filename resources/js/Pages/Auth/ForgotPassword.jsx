import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import AppLogo from '@/Components/shared/AppLogo';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-store-surface flex flex-col md:flex-row">
            <Head title="Lupa Kata Sandi" />

            {/* Left Column: Branding (Reduced version of Login/Register) */}
            <div className="hidden md:flex md:w-1/3 lg:w-2/5 bg-store-dark relative overflow-hidden flex-col p-12">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/">
                        <AppLogo theme="dark" className="h-8 w-auto mb-20" />
                    </Link>

                    <div className="mt-auto">
                        <h2 className="text-3xl font-black text-white leading-tight mb-4">
                            Pulihkan Akun Anda
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Kami di sini untuk membantu Anda kembali ke permainan. Masukkan email Anda untuk memulai proses pemulihan.
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

                    <div className="mb-10">
                        <h1 className="text-2xl font-black text-store-dark mb-2">Lupa Kata Sandi?</h1>
                        <p className="text-sm text-store-muted leading-relaxed">
                            Beri tahu kami alamat email Anda dan kami akan mengirimkan tautan reset kata sandi melalui email.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm font-bold text-green-700 leading-relaxed">
                                {status}
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            label="Alamat Email"
                            value={data.email}
                            placeholder="Masukkan email terdaftar"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <div className="pt-2">
                            <Button className="w-full" disabled={processing} type="submit">
                                Kirim Tautan Reset
                            </Button>
                        </div>

                        <div className="text-center pt-8 border-t border-store-border">
                            <Link href={route('login')} className="text-xs font-bold text-store-subtle hover:text-admin-accent transition-colors">
                                ← Kembali ke halaman Masuk
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
