import { Head, usePage } from '@inertiajs/react';
import GuestNavbar from '@/Components/guest/GuestNavbar';
import GuestFooter from '@/Components/guest/GuestFooter';

/**
 * GuestLayout — Minimal wrapper layout for all public guest pages.
 * Each page manages its own heading / hero section.
 * Navbar is `h-16 + py-4 = ~88px` tall, so `pt-[88px]` aligns content.
 */
export default function GuestLayout({ children, title, subtitle }) {
    const { flash } = usePage().props;

    return (
        <div className="min-h-screen bg-store-charcoal font-sans flex flex-col text-white selection:bg-store-accent/30 selection:text-white">
            <Head title={title ? `${title} — Mall Store` : 'Mall Store'} />

            {/* Background Texture */}
            <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none z-0" />

            {/* Navbar */}
            <GuestNavbar />

            {/* Main Content — pt-[88px] aligns with sticky navbar height */}
            <main className="flex-grow pt-[88px] relative z-10 animate-fade-in">
                {flash?.error && (
                    <div className="section-container pb-4">
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-[10px] font-bold text-red-400 uppercase tracking-wide leading-relaxed">
                            {flash.error}
                        </div>
                    </div>
                )}
                {flash?.success && (
                    <div className="section-container pb-4">
                        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/25 text-[10px] font-bold text-green-400 uppercase tracking-wide leading-relaxed">
                            {flash.success}
                        </div>
                    </div>
                )}
                {flash?.info && (
                    <div className="section-container pb-4">
                        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-[10px] font-bold text-sky-300 uppercase tracking-wide leading-relaxed">
                            {flash.info}
                        </div>
                    </div>
                )}
                {/* Optional page heading for inner pages (Catalog, TrackInvoice etc.) */}
                {title && (
                    <div className="section-container pt-10 pb-6">
                        <div className="space-y-1">
                            <h1 className="section-heading">{title}</h1>
                            {subtitle && (
                                <p className="section-subtext">{subtitle}</p>
                            )}
                        </div>
                    </div>
                )}

                {children}
            </main>

            {/* Footer */}
            <GuestFooter />
        </div>
    );
}
