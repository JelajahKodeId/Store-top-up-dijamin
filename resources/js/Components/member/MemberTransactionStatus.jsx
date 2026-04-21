import { Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';

/**
 * Kartu ringkas status transaksi member (top up / upgrade paket).
 */
export default function MemberTransactionStatus({
    rows = [],
    status,
    statusLabel,
    pending,
    invoiceCode,
    appEnv,
    paymentUrl,
    pakKasirDetails,
    paymentHint,
    backHref,
    backLabel,
}) {
    const label = statusLabel || status;

    return (
        <div className="mx-auto max-w-lg rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-sm">
            <dl className="space-y-3 text-sm">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <dt className="text-guest-muted">{row.label}</dt>
                        <dd className="text-right font-semibold text-guest-text">{row.value}</dd>
                    </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-guest-border pt-3">
                    <dt className="text-guest-muted">Status</dt>
                    <dd className="font-semibold capitalize text-guest-text">{label}</dd>
                </div>
            </dl>

            {pending && paymentUrl && (
                <div className="mt-6 space-y-3">
                    <a href={paymentUrl} target="_blank" rel="noreferrer">
                        <Button variant="dark" className="w-full">
                            Lanjutkan pembayaran
                        </Button>
                    </a>
                    {paymentHint && (
                        <p className="text-center text-xs leading-relaxed text-guest-subtle">{paymentHint}</p>
                    )}
                </div>
            )}

            {pending && pakKasirDetails && !paymentUrl && (
                <div className="mt-6 border-t border-guest-border pt-4">
                    {pakKasirDetails.is_qris ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-2xl border-4 border-guest-border bg-white p-4 shadow-sm">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pakKasirDetails.number)}`}
                                    alt="QRIS Code"
                                    className="mx-auto block h-40 w-40 sm:h-48 sm:w-48"
                                />
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-sm font-bold text-guest-text">Scan QRIS (Mendukung Semua Dompet & Bank)</p>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-guest-muted">Mohon bayar sesuai tagihan</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                            <p className="text-xs font-bold text-blue-800">No. Virtual Account Bank {pakKasirDetails.method?.toUpperCase()}:</p>
                            <p className="font-mono text-xl font-bold tracking-wider text-blue-900">{pakKasirDetails.number}</p>
                            <p className="text-[10px] uppercase text-blue-700">Gunakan metode transfer bank</p>
                        </div>
                    )}
                </div>
            )}

            {pending && !paymentUrl && !pakKasirDetails && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs font-medium text-amber-900">
                    Menunggu tautan pembayaran. Muat ulang halaman jika sudah lewat beberapa saat.
                </p>
            )}

            {pending && appEnv !== 'production' && invoiceCode && (
                <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800">Testing Mode (Sandbox)</p>
                    <Link href={route('webhooks.pak-kasir-simulate', invoiceCode)} className="inline-flex items-center gap-2 rounded-lg bg-amber-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-900 transition-colors hover:bg-amber-300">
                        Simulasi Bayar Lunas
                    </Link>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link href={backHref} className="text-xs font-bold uppercase tracking-wide text-store-accent-dark hover:underline">
                    {backLabel}
                </Link>
            </div>
        </div>
    );
}
