import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/admin/Sidebar';
import TopBar from '@/Components/admin/TopBar';
import Alert from '@/Components/ui/Alert';
import { AppIcons } from '@/Components/shared/AppIcon';

/**
 * AdminLayout — sidebar charcoal + main content area dengan toggle desktop
 */
export default function AdminLayout({ children, title = 'Dashboard', subtitle }) {
    const { flash } = usePage().props;
    const [isVisible, setIsVisible] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Flash message auto-hide logic
    useEffect(() => {
        if (flash.success || flash.error) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Icons
    const ArrowRightIcon = AppIcons.arrowRight;

    // Toggle sidebar on desktop
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    // Open mobile drawer
    const openMobile = () => setIsMobileOpen(true);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <div className="h-screen bg-admin-bg flex font-sans text-store-charcoal selection:bg-store-accent/20 overflow-hidden">
            {/* ── Sidebar Desktop ── */}
            <aside
                className={`hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out border-r border-store-border-dark ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                <Sidebar isCollapsed={isCollapsed} />
            </aside>

            {/* ── Sidebar Mobile Drawer ── */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden flex transition-opacity duration-300">
                    <div
                        className="fixed inset-0 bg-store-dark/60 backdrop-blur-sm animate-fade-in"
                        onClick={closeMobile}
                    />
                    <div className="relative w-64 flex-shrink-0 shadow-2xl animate-slide-left h-full">
                        <Sidebar onClose={closeMobile} isMobile />
                    </div>
                </div>
            )}

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                <TopBar
                    title={title}
                    subtitle={subtitle}
                    isCollapsed={isCollapsed}
                    onToggleSidebar={toggleSidebar}
                    onMenuClick={openMobile}
                />

                <div className="flex-1 overflow-y-auto flex flex-col bg-admin-bg">
                    <main className="flex-1 p-4 sm:p-6 lg:p-10 animate-fade-in relative z-0">
                        <div className="max-w-7xl mx-auto space-y-8">
                            {isVisible && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    {flash.success && (
                                        <Alert type="success" title="Berhasil">
                                            {flash.success}
                                        </Alert>
                                    )}
                                    {flash.error && (
                                        <Alert type="danger" title="Kesalahan">
                                            {flash.error}
                                        </Alert>
                                    )}
                                </div>
                            )}
                            {children}
                        </div>
                    </main>

                    <footer className="px-6 sm:px-10 py-8 border-t border-store-border bg-white flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold uppercase tracking-widest text-store-subtle gap-4 mt-auto">
                        <div className="flex items-center gap-4">
                            <span>&copy; {new Date().getFullYear()} Store Dijamin</span>
                            <span className="hidden sm:inline border-l border-store-border h-3" />
                            <span className="text-store-muted">v2.4.0 Deluxe Edition</span>
                        </div>
                        <a href="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-store-border hover:bg-admin-bg hover:text-store-charcoal transition-all">
                            Kembali ke Situs Utama <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </footer>
                </div>
            </div>
        </div>
    );
}
