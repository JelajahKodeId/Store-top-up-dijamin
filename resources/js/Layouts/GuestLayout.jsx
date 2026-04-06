import { Head } from '@inertiajs/react';
import GuestNavbar from '@/Components/guest/GuestNavbar';
import GuestFooter from '@/Components/guest/GuestFooter';

/**
 * GuestLayout — Minimal wrapper layout for all public guest pages.
 * Each page manages its own heading / hero section.
 * Navbar is `h-16 + py-4 = ~88px` tall, so `pt-[88px]` aligns content.
 */
export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-store-charcoal font-sans flex flex-col text-white selection:bg-store-accent/30 selection:text-white">
            <Head title={title ? `${title} — Mall Store` : 'Mall Store'} />

            {/* Background Texture */}
            <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none z-0" />

            {/* Navbar */}
            <GuestNavbar />

            {/* Main Content — pt-[88px] aligns with sticky navbar height */}
            <main className="flex-grow pt-[88px] relative z-10 animate-fade-in">
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
