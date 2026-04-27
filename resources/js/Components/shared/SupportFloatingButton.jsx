import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function SupportFloatingButton() {
    const { site } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);

    // Jangan tampilkan jika tidak ada kontak yang diset
    if (!site?.whatsapp && !site?.telegram) return null;

    const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null;
    const tgLink = site.telegram ? (site.telegram.startsWith('http') ? site.telegram : `https://t.me/${site.telegram.replace('@', '')}`) : null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
            {/* Options Panel */}
            <div className={`flex flex-col gap-2 transition-all duration-300 origin-bottom ${
                isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
            }`}>
                {tgLink && (
                    <a 
                        href={tgLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-5 py-3 rounded-2xl shadow-lux flex items-center gap-3 text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-1"
                    >
                        <AppIcons.telegram size={18} /> 
                        <span>Telegram Center</span>
                    </a>
                )}
                {waLink && (
                    <a 
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 rounded-2xl shadow-lux flex items-center gap-3 text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-1"
                    >
                        <AppIcons.whatsapp size={18} />
                        <span>WhatsApp Support</span>
                    </a>
                )}
            </div>

            {/* Sticky Main Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative bg-store-accent hover:bg-store-accent-dark text-amber-950 px-6 py-3.5 rounded-full shadow-lux flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group ${
                    isOpen ? 'ring-4 ring-store-accent/30' : ''
                }`}
                aria-label="Butuh Bantuan?"
            >
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                        <AppIcons.help size={20} />
                    </div>
                    <div className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
                        <AppIcons.close size={20} />
                    </div>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.15em]">Bantuan</span>
                
                {/* Notification pulse (only when closed) */}
                {!isOpen && (
                    <span className="absolute top-0.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-store-accent-dark opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-store-accent-dark border border-white"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
