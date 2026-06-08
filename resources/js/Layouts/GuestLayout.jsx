import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLogo from '@/Components/shared/AppLogo';
import { AppIcons } from '@/Components/shared/AppIcon';
import GuestNavbar from '@/Components/guest/GuestNavbar';
import GuestFooter from '@/Components/guest/GuestFooter';
import SupportFloatingButton from '@/Components/shared/SupportFloatingButton';
import PurchaseNotification from '@/Components/shared/PurchaseNotification';

/**
 * GuestLayout — wrapper halaman publik (tema putih / abu).
 *
 * @param {boolean} [memberArea=false] — area /member: bilah atas disederhanakan.
 * @param {boolean} [hidePageHeading=false] — sembunyikan blok judul bawaan (judul diatur di dalam children, mis. MemberLayout).
 */
export default function GuestLayout({ children, title: manualTitle, subtitle: manualSubtitle, memberArea = false, hidePageHeading = false }) {
    const { props } = usePage();
    const title = manualTitle || props.title;
    const subtitle = manualSubtitle || props.subtitle;
    const { flash, site } = props;
    const docTitle = title ? `${title} — Mall Store` : 'Mall Store';

    const [showAnnouncement, setShowAnnouncement] = useState(false);

    useEffect(() => {
        if (site?.announcement) {
            const isHidden = localStorage.getItem('hide_announcement') === 'true';
            if (!isHidden) {
                setShowAnnouncement(true);
            }
        }
    }, [site?.announcement]);

    const handleCloseAnnouncement = () => {
        setShowAnnouncement(false);
    };

    return (
        <div className="flex min-h-screen flex-col bg-guest-bg font-sans text-sm font-normal leading-normal text-guest-text antialiased selection:bg-store-accent/25 selection:text-guest-text sm:text-base">
            <Head title={docTitle}>
                {site?.keywords && <meta name="keywords" content={site.keywords} />}
                {site?.description && <meta name="description" content={site.description} />}
            </Head>

            {/* Announcement Modal */}
            {showAnnouncement && site?.announcement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={handleCloseAnnouncement}
                            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <AppIcons.close size={20} />
                        </button>

                        <div className="mb-4 flex justify-center">
                            <AppLogo size="md" />
                        </div>
                        
                        <div className="mb-6 max-h-[60vh] overflow-y-auto px-2">
                            <h3 className="font-poppins mb-3 text-center text-lg font-bold uppercase tracking-wide text-gray-800">Pengumuman</h3>
                            <p className="whitespace-pre-wrap text-center text-[13px] leading-relaxed text-gray-600">
                                {site.announcement}
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-2">
                            <label className="flex cursor-pointer items-center gap-2 group">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            localStorage.setItem('hide_announcement', 'true');
                                        } else {
                                            localStorage.removeItem('hide_announcement');
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-store-accent focus:ring-store-accent transition-colors"
                                />
                                <span className="font-poppins text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-700">Jangan tampilkan lagi</span>
                            </label>
                            
                            <button
                                onClick={handleCloseAnnouncement}
                                className="font-poppins rounded-lg bg-store-accent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-amber-400"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GuestNavbar memberArea={memberArea} />

            <main className="relative z-10 flex-grow animate-fade-in pt-24 sm:pt-[5.75rem]">
                {flash?.error && (
                    <div className="section-container pb-3 pt-3">
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium leading-normal text-red-800 sm:p-4">
                            {flash.error}
                        </div>
                    </div>
                )}
                {flash?.success && (
                    <div className="section-container pb-3 pt-3">
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium leading-snug text-green-900 sm:p-4">
                            {flash.success}
                        </div>
                    </div>
                )}
                {flash?.info && (
                    <div className="section-container pb-3 pt-3">
                        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-medium leading-normal text-sky-900 sm:p-4">
                            {flash.info}
                        </div>
                    </div>
                )}

                {!hidePageHeading && title && (
                    <div className="section-container pb-4 pt-6 sm:pb-5 sm:pt-8">
                        <div className="space-y-0.5">
                            <h1 className="section-heading">{title}</h1>
                            {subtitle && <p className="section-subtext">{subtitle}</p>}
                        </div>
                    </div>
                )}

                {children}
            </main>

            <GuestFooter />
            <SupportFloatingButton />
            <PurchaseNotification />
        </div>
    );
}
