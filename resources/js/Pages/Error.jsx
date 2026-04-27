import { Head, Link } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Error({ status, message }) {
    const title = {
        503: 'Layanan Sedang Maintenance',
        500: 'Terjadi Kesalahan Server',
        404: 'Halaman Tidak Ditemukan',
        403: 'Akses Dilarang',
        405: 'Metode Tidak Diizinkan',
        419: 'Sesi Telah Kedaluwarsa',
    }[status] || 'Terjadi Kesalahan';

    const description = {
        503: 'Maaf, kami sedang melakukan pemeliharaan rutin. Silakan kembali beberapa saat lagi.',
        500: 'Ups! Terjadi kesalahan di server kami. Tim teknis kami sedang berusaha memperbaikinya.',
        404: 'Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.',
        405: 'Maaf, metode permintaan tidak diizinkan untuk rute ini.',
        419: 'Maaf, sesi Anda telah habis karena sudah terlalu lama. Silakan segarkan halaman.',
    }[status] || 'Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.';

    const ErrorIcon = {
        404: AppIcons.help,
        403: AppIcons.lock,
        419: AppIcons.clock,
        500: AppIcons.alert,
        503: AppIcons.speed,
    }[status] || AppIcons.alert;

    return (
        <div className="min-h-screen bg-guest-surface flex items-center justify-center p-6 font-sans">
            <Head title={`${status}: ${title}`} />
            
            <div className="max-w-md w-full text-center">
                {/* Visual Error Code */}
                <div className="relative mb-8">
                    <div className="text-[8rem] sm:text-[10rem] font-black leading-none text-zinc-100 select-none">
                        {status}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-5 rounded-3xl bg-white shadow-lux border border-guest-border animate-bounce-slow">
                            <ErrorIcon size={48} className="text-store-accent" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="font-bebas text-3xl sm:text-4xl font-bold uppercase tracking-wide text-guest-text mb-3">
                    {title}
                </h1>
                <p className="text-zinc-600 text-base sm:text-lg mb-10 leading-relaxed px-4">
                    {description}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase tracking-wide text-sm rounded-xl transition-all shadow-lg active:scale-[0.98]"
                    >
                        <AppIcons.home size={16} />
                        Kembali ke Beranda
                    </Link>
                    
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-guest-border hover:bg-zinc-50 text-guest-text font-bold uppercase tracking-wide text-sm rounded-xl transition-all active:scale-[0.98]"
                    >
                        <AppIcons.refresh size={16} />
                        Segarkan Halaman
                    </button>
                </div>

                {/* Footer Info */}
                <p className="mt-12 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    MALLSTORE ID &copy; {new Date().getFullYear()}
                </p>
            </div>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-store-accent/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-store-accent/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}

// Custom animation (tambahkan di app.css jika belum ada)
// .animate-bounce-slow { animation: bounce 3s infinite; }
