import MemberLayout from '@/Layouts/MemberLayout';
import MemberTransactionStatus from '@/Components/member/MemberTransactionStatus';
import { formatRp } from '@/utils/formatRp';
import { memberPaymentStatusLabel } from '@/utils/memberPaymentStatusLabel';

export default function TopupStatus({ topup, app_env }) {
    const pending = topup.status === 'pending';

    const rows = [
        { label: 'Nominal', value: formatRp(topup.amount) },
        { label: 'Biaya Layanan', value: formatRp(topup.fee_amount || 0) },
        { label: 'Total Pembayaran', value: formatRp(topup.amount + (topup.fee_amount || 0)) },
        { label: 'Dibuat', value: topup.created_at },
        ...(pending && topup.payment_expired_at ? [{ label: 'Batas Bayar', value: topup.payment_expired_at }] : []),
    ];

    return (
        <MemberLayout title="Status Top Up" subtitle={`Invoice ${topup.invoice_code}`}>
            <section className="section-container mx-auto max-w-lg pb-16 pt-2">
                <MemberTransactionStatus
                    rows={rows}
                    status={topup.status}
                    statusLabel={memberPaymentStatusLabel(topup.status)}
                    pending={pending}
                    invoiceCode={topup.invoice_code}
                    appEnv={app_env}
                    paymentUrl={topup.payment_url}
                    directPaymentDetails={topup.direct_payment_details}
                    manualPaymentDetails={topup.manual_payment_details}
                    paymentHint="Saldo otomatis masuk ke akun Anda setelah pembayaran dikonfirmasi."
                    backHref={route('member.topup.index')}
                    backLabel="← Kembali ke Top Up"
                />
            </section>
        </MemberLayout>
    );
}
