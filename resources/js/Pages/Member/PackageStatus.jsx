import MemberLayout from '@/Layouts/MemberLayout';
import MemberTransactionStatus from '@/Components/member/MemberTransactionStatus';
import { formatRp } from '@/utils/formatRp';
import { memberPaymentStatusLabel } from '@/utils/memberPaymentStatusLabel';

export default function PackageStatus({ upgrade }) {
    const pending = upgrade.status === 'pending';

    const rows = [
        { label: 'Paket', value: upgrade.target_label },
        { label: 'Nominal', value: formatRp(upgrade.amount) },
        { label: 'Dibuat', value: upgrade.created_at },
    ];

    return (
        <MemberLayout title="Status upgrade paket" subtitle={`Invoice ${upgrade.invoice_code}`}>
            <section className="section-container mx-auto max-w-lg pb-16 pt-2">
                <MemberTransactionStatus
                    rows={rows}
                    status={upgrade.status}
                    statusLabel={memberPaymentStatusLabel(upgrade.status)}
                    pending={pending}
                    paymentUrl={upgrade.payment_url}
                    paymentHint="Setelah pembayaran dikonfirmasi, level akun Anda akan diperbarui otomatis."
                    backHref={route('member.packages.index')}
                    backLabel="← Kembali ke pilih paket"
                />
            </section>
        </MemberLayout>
    );
}
