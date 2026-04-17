import MemberLayout from '@/Layouts/MemberLayout';
import MemberTransactionStatus from '@/Components/member/MemberTransactionStatus';
import { formatRp } from '@/utils/formatRp';
import { memberPaymentStatusLabel } from '@/utils/memberPaymentStatusLabel';

export default function TopupStatus({ topup }) {
    const pending = topup.status === 'pending';

    const rows = [
        { label: 'Nominal', value: formatRp(topup.amount) },
        { label: 'Dibuat', value: topup.created_at },
    ];

    return (
        <MemberLayout title="Status Top Up" subtitle={`Invoice ${topup.invoice_code}`}>
            <section className="section-container mx-auto max-w-lg pb-16 pt-2">
                <MemberTransactionStatus
                    rows={rows}
                    status={topup.status}
                    statusLabel={memberPaymentStatusLabel(topup.status)}
                    pending={pending}
                    paymentUrl={topup.payment_url}
                    paymentHint="Selesaikan pembayaran di tab baru. Saldo akan bertambah otomatis setelah gateway mengonfirmasi."
                    backHref={route('member.topup.index')}
                    backLabel="← Kembali ke Top Up"
                />
            </section>
        </MemberLayout>
    );
}
