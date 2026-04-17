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
    paymentUrl,
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

            {pending && !paymentUrl && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs font-medium text-amber-900">
                    Menunggu tautan pembayaran. Muat ulang halaman jika sudah lewat beberapa saat.
                </p>
            )}

            <div className="mt-6 text-center">
                <Link href={backHref} className="text-xs font-bold uppercase tracking-wide text-store-accent-dark hover:underline">
                    {backLabel}
                </Link>
            </div>
        </div>
    );
}
