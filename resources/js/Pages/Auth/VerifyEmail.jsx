import { Head, Link, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import AppLogo from '@/Components/shared/AppLogo';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-store-surface flex flex-col md:flex-row">
            <Head title="Verifikasi Email" />

            {/* Left Column: Branding */}
            <div className="hidden md:flex md:w-1/3 lg:w-2/5 bg-store-dark relative overflow-hidden flex-col p-12">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="relative z-10 flex flex-col h-full">
                    <Link href="/">
                        <AppLogo theme="dark" className="h-8 w-auto mb-20" />
                    </Link>

                    <div className="mt-auto">
                        <h2 className="text-3xl font-black text-white leading-tight mb-4">
                            Langkah Terakhir Anda
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Verifikasi email untuk memastikan keamanan akun dan menerima riwayat transaksi top-up secara instan.
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

                    <div className="mb-10">
                        <h1 className="text-2xl font-black text-store-dark mb-2">Verifikasi Email</h1>
                        <p className="text-sm text-store-muted leading-relaxed">
                            Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi alamat email Anda melalui tautan yang kami kirimkan.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                            <p className="text-sm font-bold text-green-700 leading-relaxed">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="pt-2">
                            <Button className="w-full" disabled={processing} type="submit">
                                Kirim Ulang Email Verifikasi
                            </Button>
                        </div>

                        <div className="text-center pt-8 border-t border-store-border flex flex-col gap-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                                Keluar Akun
                            </Link>

                            <Link href="/" className="text-xs font-bold text-store-subtle hover:text-store-dark transition-colors">
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
