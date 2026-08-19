import { Link, useForm, usePage } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Pagination from '@/Components/ui/Pagination';
import { formatRp } from '@/utils/formatRp';

export default function Topup({ history, paymentChannels, checkoutGateway, minAmount }) {
    const { auth } = usePage().props;
    const balance = auth?.user?.balance ?? 0;
    const defaultMethod = paymentChannels?.[0]?.code ?? '';

    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        payment_method: defaultMethod,
    });

    const selectedChannel = paymentChannels?.find(c => c.code === data.payment_method);
    const amountNum = Number(data.amount) || 0;
    
    let feeAmount = 0;
    if (selectedChannel && !selectedChannel.code.startsWith('manual_')) {
        const feeFlat = Number(selectedChannel.fee) || 0;
        const feePct = Number(selectedChannel.fee_pct) || 0;
        feeAmount = feeFlat + (amountNum * feePct / 100);
    }
    const totalPay = amountNum + feeAmount;

    const submit = (e) => {
        e.preventDefault();
        post(route('member.topup.store'));
    };

    return (
        <MemberLayout title="Top Up Saldo" subtitle={`Saldo Anda saat ini: ${formatRp(balance)}`}>
            <section className="section-container mx-auto max-w-lg space-y-8 pb-16">
                <div className="rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-sm">
                    <h2 className="mb-1 text-xs font-black uppercase tracking-widest text-guest-subtle">Masukkan nominal Top Up</h2>
                    <p className="mb-4 text-xs text-guest-muted">
                        Minimum nominal top up adalah {formatRp(minAmount)}. Gateway: <span className="font-semibold">{checkoutGateway}</span>
                    </p>
                    <form onSubmit={submit} className="space-y-4">
                        <Input
                            label="Nominal (Rp)"
                            type="number"
                            min={minAmount}
                            step="1000"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            error={errors.amount}
                            required
                        />
                        {paymentChannels?.length > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold text-guest-muted">Metode Pembayaran</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full rounded-xl border border-guest-border bg-white px-3 py-2.5 text-sm font-medium text-guest-text"
                                    >
                                        {paymentChannels.map((ch) => (
                                            <option key={ch.code} value={ch.code}>
                                                {ch.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {amountNum > 0 && (
                                    <div className="rounded-xl border border-guest-border bg-guest-elevated p-4">
                                        <div className="flex items-center justify-between border-b border-guest-border/50 pb-2 mb-2 text-sm">
                                            <span className="font-medium text-guest-muted">Biaya Admin</span>
                                            <span className="font-bold text-guest-text">{formatRp(feeAmount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-base">
                                            <span className="font-bold text-guest-subtle">Total Bayar</span>
                                            <span className="font-bold text-store-accent-dark">{formatRp(totalPay)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Button type="submit" variant="dark" className="w-full" disabled={processing}>
                            {processing ? 'Memproses…' : 'Lanjutkan Pembayaran'}
                        </Button>
                    </form>
                </div>

                <div className="rounded-2xl border border-guest-border bg-white shadow-sm">
                    <div className="border-b border-guest-border px-5 py-3">
                        <h2 className="text-xs font-black uppercase tracking-widest text-guest-subtle">Riwayat Top Up</h2>
                    </div>
                    <ul className="divide-y divide-guest-border">
                        {history.data.length === 0 && (
                            <li className="px-5 py-10 text-center text-sm text-guest-muted">Belum ada riwayat top up.</li>
                        )}
                        {history.data.map((row) => (
                            <li key={row.invoice_code} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                                <div>
                                    <p className="text-xs font-bold uppercase text-guest-subtle">{row.status_label}</p>
                                    <p className="font-semibold text-guest-text">{formatRp(row.amount)}</p>
                                </div>
                                <p className="text-xs text-guest-muted">{row.created_at}</p>
                                <Link
                                    href={route('member.topup.show', row.invoice_code)}
                                    className="text-xs font-bold uppercase text-store-accent-dark hover:underline"
                                >
                                    Detail
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Pagination links={history.links} />
                </div>
            </section>
        </MemberLayout>
    );
}
