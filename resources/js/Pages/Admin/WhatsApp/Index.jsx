import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Input, { Textarea } from '@/Components/ui/Input';
import Alert from '@/Components/ui/Alert';
import { AppIcons } from '@/Components/shared/AppIcon';

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function jsonFetch(url, options = {}) {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };
    const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

export default function WhatsAppIndex({ serverUrlConfigured, adminWhatsappHint }) {
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState(null);
    const [clientInfo, setClientInfo] = useState(null);
    const [isChecking, setIsChecking] = useState(true);
    const [nodeOffline, setNodeOffline] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const [testNumber, setTestNumber] = useState(adminWhatsappHint || '');
    const [testMessage, setTestMessage] = useState('Tes notifikasi Mall Store — jika Anda membaca ini, gateway berfungsi.');
    const [sendingTest, setSendingTest] = useState(false);
    const [testFeedback, setTestFeedback] = useState(null);

    const pollStatus = useCallback(async () => {
        if (!serverUrlConfigured) {
            setIsChecking(false);
            return;
        }
        try {
            const { ok, data } = await jsonFetch(route('admin.whatsapp.status'));
            setNodeOffline(!ok && (data?.error || true));
            if (ok) {
                setNodeOffline(false);
                setStatus(data.status ?? 'disconnected');
                // Backend mengirim qrCode saat ada string QR (status diset ke 'qr'); jangan hanya mengandalkan status === 'qr'.
                setQrCode(data.qrCode ?? null);
                if (data.status === 'ready' || data.status === 'authenticated') {
                    setClientInfo(data.info ?? null);
                } else {
                    setClientInfo(null);
                }
            }
        } catch {
            setNodeOffline(true);
        } finally {
            setIsChecking(false);
        }
    }, [serverUrlConfigured]);

    useEffect(() => {
        pollStatus();
        if (!serverUrlConfigured) return undefined;
        const fast = ['disconnected', 'starting', 'loading', 'qr'].includes(status);
        const id = setInterval(pollStatus, fast ? 1500 : 4000);
        return () => clearInterval(id);
    }, [pollStatus, serverUrlConfigured, status]);

    const handleLogout = async () => {
        if (!confirm('Putuskan sesi WhatsApp di server ini?')) return;
        setLoggingOut(true);
        try {
            const { ok, data } = await jsonFetch(route('admin.whatsapp.logout'), { method: 'POST', body: '{}' });
            if (!ok) {
                alert(data?.error || data?.message || 'Gagal logout');
            }
        } catch {
            alert('Gagal menghubungi server');
        } finally {
            setLoggingOut(false);
            pollStatus();
        }
    };

    const handleSendTest = async (e) => {
        e.preventDefault();
        setSendingTest(true);
        setTestFeedback(null);
        try {
            const { ok, data } = await jsonFetch(route('admin.whatsapp.send-test'), {
                method: 'POST',
                body: JSON.stringify({ number: testNumber, message: testMessage }),
            });
            if (ok && data.success) {
                setTestFeedback({ ok: true, text: 'Pesan terkirim. Periksa WhatsApp di nomor tujuan.' });
            } else {
                setTestFeedback({ ok: false, text: data.error || data.message || 'Gagal mengirim' });
            }
        } catch {
            setTestFeedback({ ok: false, text: 'Koneksi gagal' });
        } finally {
            setSendingTest(false);
        }
    };

    const PhoneIcon = AppIcons.phone;

    return (
        <AdminLayout
            title="WhatsApp"
            subtitle="Gateway Node.js — sambungan scan QR & notifikasi order"
        >
            <Head title="WhatsApp" />

            <div className="space-y-8">
                {!serverUrlConfigured && (
                    <Alert type="warning" title="Konfigurasi belum lengkap">
                        <p className="text-sm font-medium leading-relaxed">
                            Isi <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">WA_SERVER_URL</code> di file{' '}
                            <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">.env</code> (contoh{' '}
                            <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">http://127.0.0.1:3000</code>), lalu di
                            folder <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">wa-server/</code> jalankan{' '}
                            <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">npm install</code> dan{' '}
                            <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">npm start</code>.
                            Untuk production, set juga <code className="text-xs bg-yellow-100/80 px-1.5 py-0.5 rounded">WHATSAPP_SERVER_SECRET</code> sama di Laravel dan wa-server.
                        </p>
                    </Alert>
                )}

                {serverUrlConfigured && (
                    <Alert type="info" title="Menguji dengan nomor Anda sendiri">
                        <ol className="text-sm font-medium leading-relaxed list-decimal list-inside space-y-1.5 mt-1">
                            <li>Pastikan <code className="text-xs bg-blue-100/80 px-1 rounded">wa-server</code> berjalan dan status di bawah menjadi siap (hijau).</li>
                            <li>Scan QR dengan WhatsApp yang akan dipakai mengirim (bisa nomor baru khusus bisnis).</li>
                            <li>Isi &quot;Kirim percobaan&quot; dengan <strong>nomor HP Anda</strong> (format 08… atau 628…) lalu kirim — chat harus masuk ke HP tersebut.</li>
                            <li>Nomor admin untuk ringkasan order: isi di Pengaturan Situs → WhatsApp (atau <code className="text-xs bg-blue-100/80 px-1 rounded">WA_ADMIN_NUMBER</code> di .env).</li>
                        </ol>
                    </Alert>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* ── Koneksi & QR ── */}
                    <div className="admin-content-card overflow-hidden flex flex-col min-h-[440px]">
                        <div className="px-8 py-6 border-b border-store-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-store-charcoal uppercase tracking-tight flex items-center gap-2">
                                    <PhoneIcon size={20} className="text-store-accent" />
                                    Sambungan WhatsApp
                                </h3>
                                <p className="text-[11px] font-bold text-store-subtle uppercase tracking-widest mt-1">
                                    Scan QR — sesi tersimpan di server Node
                                </p>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col bg-admin-bg/50">
                            {!serverUrlConfigured && (
                                <p className="text-sm text-store-subtle font-medium text-center m-auto max-w-sm leading-relaxed">
                                    Setelah <code className="text-xs bg-white px-1 py-0.5 rounded border border-store-border">WA_SERVER_URL</code>{' '}
                                    diisi, bagian ini menampilkan status dan QR.
                                </p>
                            )}

                            {serverUrlConfigured && isChecking && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-store-subtle">
                                    <div className="w-10 h-10 border-2 border-store-charcoal border-t-store-accent rounded-full animate-spin" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Menghubungkan ke wa-server…</p>
                                </div>
                            )}

                            {serverUrlConfigured && !isChecking && nodeOffline && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                                        <AppIcons.error size={32} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-black text-store-charcoal uppercase tracking-tight text-sm">wa-server tidak terjangkau</p>
                                        <p className="text-xs text-store-subtle font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                                            Jalankan Node di folder wa-server dan pastikan URL di .env sama dengan alamat yang bisa diakses PHP (localhost atau IP internal).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {serverUrlConfigured && !isChecking && !nodeOffline && (status === 'starting' || status === 'loading') && !qrCode && (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-store-subtle">
                                    <div className="w-10 h-10 border-2 border-store-charcoal border-t-store-accent rounded-full animate-spin" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-center max-w-xs">
                                        Membuka WhatsApp Web… QR akan muncul di sini
                                    </p>
                                </div>
                            )}

                            {serverUrlConfigured && !isChecking && !nodeOffline && (status === 'qr' || qrCode) && (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="bg-white p-4 rounded-2xl border-2 border-store-border shadow-soft">
                                        {qrCode ? (
                                            <img src={qrCode} alt="QR WhatsApp" className="w-56 h-56 object-contain" />
                                        ) : (
                                            <div className="w-56 h-56 flex items-center justify-center text-store-subtle text-sm font-bold">
                                                Menunggu QR…
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-store-subtle font-bold uppercase tracking-wide text-center max-w-xs leading-relaxed">
                                        WhatsApp di HP → Perangkat tertaut → Tautkan perangkat → pindai kode
                                    </p>
                                </div>
                            )}

                            {serverUrlConfigured && !isChecking && !nodeOffline && (status === 'ready' || status === 'authenticated') && (
                                <div className="flex flex-col items-center gap-6 flex-1 justify-center">
                                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                        <AppIcons.success_circle size={40} className="text-emerald-600" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-lg font-black text-store-charcoal uppercase tracking-tight">Terhubung</p>
                                        <p className="text-sm text-store-subtle font-medium">
                                            {clientInfo?.pushname ? `Nama di WA: ${clientInfo.pushname}` : 'Siap mengirim notifikasi pesanan'}
                                        </p>
                                        {clientInfo?.wid?.user && (
                                            <p className="text-xs font-mono text-store-muted">+{clientInfo.wid.user}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                        disabled={loggingOut}
                                        onClick={handleLogout}
                                    >
                                        {loggingOut ? 'Memutuskan…' : 'Putus sesi / logout WA'}
                                    </Button>
                                </div>
                            )}

                            {serverUrlConfigured && !isChecking && !nodeOffline && status === 'disconnected' && !qrCode && (
                                <p className="text-sm text-store-subtle font-medium text-center m-auto max-w-sm leading-relaxed">
                                    Menunggu koneksi… Restart <code className="text-xs bg-white px-1 rounded border border-store-border">wa-server</code> atau
                                    periksa log Node jika tidak berubah. Jika QR tidak pernah muncul, hapus folder sesi{' '}
                                    <code className="text-xs bg-white px-1 rounded border border-store-border">wa-server/.wwebjs_auth</code> lalu jalankan ulang Node.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Kanan: admin + tes ── */}
                    <div className="space-y-8">
                        <div className="admin-content-card p-8 space-y-4">
                            <div className="border-b border-store-border pb-5">
                                <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Nomor notifikasi admin</h3>
                                <p className="text-xs text-store-subtle font-bold uppercase mt-1">
                                    Ringkasan order baru &amp; key terkirim
                                </p>
                            </div>
                            <p className="text-sm text-store-subtle font-medium leading-relaxed">
                                Diutamakan dari <strong className="text-store-charcoal">Pengaturan Situs</strong> (field WhatsApp). Kosongkan di sana
                                hanya jika ingin memakai fallback <code className="text-xs bg-admin-bg px-1.5 py-0.5 rounded border border-store-border">WA_ADMIN_NUMBER</code> di .env.
                            </p>
                            <Link href={route('admin.settings.index')}>
                                <Button variant="secondary" size="sm" className="rounded-xl">
                                    Buka Pengaturan Situs
                                    <AppIcons.arrowRight size={14} className="ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="admin-content-card p-8 space-y-6">
                            <div className="border-b border-store-border pb-5">
                                <h3 className="text-lg font-black text-store-charcoal uppercase tracking-tighter">Kirim percobaan</h3>
                                <p className="text-xs text-store-subtle font-bold uppercase mt-1">
                                    Uji ke nomor Anda — butuh status &quot;Terhubung&quot;
                                </p>
                            </div>
                            <form onSubmit={handleSendTest} className="space-y-5">
                                <Input
                                    label="Nomor tujuan (HP Anda)"
                                    value={testNumber}
                                    onChange={(e) => setTestNumber(e.target.value)}
                                    placeholder="081234567890 atau 6281234567890"
                                    icon="phone"
                                    required
                                />
                                <Textarea
                                    label="Isi pesan"
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    rows={4}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="accent"
                                    className="w-full rounded-xl py-3.5 font-black uppercase tracking-widest text-xs"
                                    disabled={sendingTest || status !== 'ready' || !serverUrlConfigured}
                                >
                                    {sendingTest ? 'Mengirim…' : 'Kirim pesan uji'}
                                </Button>
                                {serverUrlConfigured && status !== 'ready' && (
                                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                                        Hubungkan WhatsApp (status hijau) terlebih dahulu.
                                    </p>
                                )}
                                {testFeedback && (
                                    <div
                                        className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                                            testFeedback.ok
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                                : 'bg-red-50 border-red-100 text-red-800'
                                        }`}
                                    >
                                        {testFeedback.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
