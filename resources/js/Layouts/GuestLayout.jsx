import { Head, usePage } from '@inertiajs/react';
import GuestNavbar from '@/Components/guest/GuestNavbar';
import GuestFooter from '@/Components/guest/GuestFooter';

/**
 * GuestLayout — wrapper halaman publik (tema putih / abu).
 */
export default function GuestLayout({ children, title, subtitle }) {
    const { flash } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col bg-guest-bg font-sans text-sm font-normal leading-normal text-guest-text antialiased selection:bg-store-accent/25 selection:text-guest-text sm:text-base">
            <Head title={title ? `${title} — Mall Store` : 'Mall Store'} />

            <GuestNavbar />

            <main className="relative z-10 flex-grow animate-fade-in pt-[88px]">
                {flash?.error && (
                    <div className="section-container pb-4">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium leading-normal text-red-800 sm:p-4">
                            {flash.error}
                        </div>
                    </div>
                )}
                {flash?.success && (
                    <div className="section-container pb-4">
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-snug text-green-900">
                            {flash.success}
                        </div>
                    </div>
                )}
                {flash?.info && (
                    <div className="section-container pb-4">
                        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-medium leading-normal text-sky-900 sm:p-4">
                            {flash.info}
                        </div>
                    </div>
                )}
                {title && (
                    <div className="section-container pb-4 pt-6 sm:pb-5 sm:pt-8">
                        <div className="space-y-0.5">
                            <h1 className="section-heading">{title}</h1>
                            {subtitle && (
                                <p className="section-subtext">{subtitle}</p>
                            )}
                        </div>
                    </div>
                )}

                {children}
            </main>

            <GuestFooter />
        </div>
    );
}
