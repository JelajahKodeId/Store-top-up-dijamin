import MemberLayout from '@/Layouts/MemberLayout';
import MemberTransactionStatus from '@/Components/member/MemberTransactionStatus';
import { formatRp } from '@/utils/formatRp';
import { memberPaymentStatusLabel } from '@/utils/memberPaymentStatusLabel';

export default function PackageStatus({ upgrade, app_env }) {
    const pending = upgrade.status === 'pending';

    const rows = [
        { label: 'Paket', value: upgrade.target_label },
        { label: 'Nominal', value: formatRp(upgrade.amount) },
        { label: 'Biaya Layanan', value: formatRp(upgrade.fee_amount || 0) },
        { label: 'Total Pembayaran', value: formatRp(upgrade.amount + (upgrade.fee_amount || 0)) },
        { label: 'Dibuat', value: upgrade.created_at },
        ...(pending && upgrade.payment_expired_at ? [{ label: 'Batas Bayar', value: upgrade.payment_expired_at }] : []),
    ];

    return (
        <MemberLayout title="Status upgrade paket" subtitle={`Invoice ${upgrade.invoice_code}`}>
            <section className="section-container mx-auto max-w-lg pb-16 pt-2">
                <MemberTransactionStatus
                    rows={rows}
                    status={upgrade.status}
                    statusLabel={memberPaymentStatusLabel(upgrade.status)}
                    pending={pending}
                    invoiceCode={upgrade.invoice_code}
                    appEnv={app_env}
                    paymentUrl={upgrade.payment_url}
                    directPaymentDetails={upgrade.direct_payment_details}
                    manualPaymentDetails={upgrade.manual_payment_details}
                    paymentHint="Setelah pembayaran dikonfirmasi, level akun Anda akan diperbarui otomatis."
                    backHref={route('member.packages.index')}
                    backLabel="← Kembali ke pilih paket"
                />
            </section>
        </MemberLayout>
    );
}
