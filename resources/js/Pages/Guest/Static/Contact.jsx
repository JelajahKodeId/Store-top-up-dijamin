import { Head, usePage } from '@inertiajs/react';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Contact() {
    const { site } = usePage().props;

    const waNumber = site?.whatsapp || '6281234567890';
    const waLink = `https://wa.me/${waNumber.replace(/\D/g, '')}`;
    const email = site?.contact_email || 'support@store.local';

    return (
        <>
            <Head title="Kontak Support" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-soft sm:p-10">
                    <div className="text-center">
                        <h1 className="mb-4 text-3xl font-extrabold text-store-accent">Hubungi Kami</h1>
                        <p className="mb-8 text-guest-muted">
                            Ada pertanyaan atau masalah dengan pesanan Anda? Tim dukungan kami siap membantu Anda!
                        </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* WhatsApp Card */}
                        <div className="flex flex-col items-center justify-center rounded-xl border border-guest-border bg-guest-elevated p-8 text-center transition-all hover:border-store-primary">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                                <AppIcons.whatsapp size={32} />
                            </div>
                            <h2 className="mb-2 text-xl font-bold text-guest-text">WhatsApp Support</h2>
                            <p className="mb-6 text-sm text-guest-subtle">
                                CS kami beroperasi pada pukul 08:00 - 22:00 WIB.
                            </p>
                            <a 
                                href={waLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-xl bg-store-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-store-primary/90 hover:shadow-lg active:scale-95"
                            >
                                Chat Sekarang
                            </a>
                        </div>

                        {/* Email Card */}
                        <div className="flex flex-col items-center justify-center rounded-xl border border-guest-border bg-guest-elevated p-8 text-center transition-all hover:border-store-accent">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-store-accent/10 text-store-accent">
                                <AppIcons.mail size={32} />
                            </div>
                            <h2 className="mb-2 text-xl font-bold text-guest-text">Email Support</h2>
                            <p className="mb-6 text-sm text-guest-subtle">
                                Untuk kerjasama, komplain berat, atau laporan bug.
                            </p>
                            <a 
                                href={`mailto:${email}`} 
                                className="inline-flex items-center justify-center rounded-xl bg-store-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-store-dark transition-all hover:bg-store-accent/90 hover:shadow-lg active:scale-95"
                            >
                                Kirim Email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
