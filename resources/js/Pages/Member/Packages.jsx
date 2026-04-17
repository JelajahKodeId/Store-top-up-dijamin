import { Link, useForm } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Button from '@/Components/ui/Button';
import { formatRp } from '@/utils/formatRp';

export default function Packages({ packages, currentTierLabel, paymentChannels, checkoutGateway, history }) {
    const defaultMethod = paymentChannels?.[0]?.code ?? '';

    const { data, setData, post, processing, errors } = useForm({
        target_tier: '',
        payment_method: defaultMethod,
    });

    const choose = (code) => {
        setData('target_tier', code);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!data.target_tier) return;
        post(route('member.packages.store'));
    };

    return (
        <MemberLayout
            title="Pilih Paket"
            subtitle={`Level akun Anda saat ini: ${currentTierLabel}. Upgrade untuk mendapatkan benefit reseller atau VIP.`}
        >
            <section className="section-container space-y-10 pb-16">
                <form onSubmit={submit} className="space-y-8">
                    <div>
                        <h2 className="mb-4 text-center font-bebas text-2xl font-bold uppercase tracking-wide text-guest-text sm:text-3xl">
                            Pilih Paket
                        </h2>
                        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.code}
                                    className={`relative rounded-2xl border-2 p-6 shadow-sm transition-all ${
                                        data.target_tier === pkg.code
                                            ? 'border-store-accent bg-store-accent/5 ring-2 ring-store-accent/30'
                                            : 'border-guest-border bg-guest-surface hover:border-guest-muted'
                                    } ${!pkg.purchasable ? 'opacity-60' : ''}`}
                                >
                                    <div className="absolute right-4 top-4">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                                pkg.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                                            }`}
                                        >
                                            {pkg.active ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                    <p className="mb-1 text-2xl font-bold text-guest-text">{formatRp(pkg.price)}</p>
                                    <p className="mb-4 text-lg font-bold text-store-accent-dark">{pkg.label}</p>
                                    <p className="mb-4 text-xs leading-relaxed text-guest-muted">
                                        {pkg.code === 'reseller' &&
                                            'Harga khusus reseller, prioritas antrian, dan benefit penjualan.'}
                                        {pkg.code === 'vip' && 'Akses VIP dengan benefit maksimal untuk pelanggan setia.'}
                                    </p>
                                    {pkg.purchasable ? (
                                        <button
                                            type="button"
                                            onClick={() => choose(pkg.code)}
                                            className={`w-full rounded-xl py-3 text-sm font-bold transition-colors ${
                                                data.target_tier === pkg.code
                                                    ? 'bg-store-accent text-store-dark'
                                                    : 'border border-guest-border bg-white text-guest-text hover:bg-guest-elevated'
                                            }`}
                                        >
                                            {data.target_tier === pkg.code ? 'Dipilih' : 'Pilih paket'}
                                        </button>
                                    ) : (
                                        <p className="text-center text-xs font-semibold text-guest-subtle">
                                            {pkg.active ? 'Paket aktif' : 'Tidak tersedia untuk level Anda'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {paymentChannels?.length > 0 && (
                        <div className="mx-auto max-w-md">
                            <label className="mb-2 block text-sm font-semibold text-guest-text">Metode pembayaran</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full rounded-xl border border-guest-border bg-white px-3 py-3 text-sm text-guest-text"
                            >
                                {paymentChannels.map((ch) => (
                                    <option key={ch.code} value={ch.code}>
                                        {ch.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-guest-muted">Gateway: {checkoutGateway}</p>
                        </div>
                    )}

                    {errors.target_tier && (
                        <p className="text-center text-sm font-medium text-red-600">{errors.target_tier}</p>
                    )}

                    <div className="flex justify-center">
                        <Button type="submit" variant="dark" className="min-w-[200px]" disabled={processing || !data.target_tier}>
                            {processing ? 'Memproses…' : 'Lanjutkan pembayaran'}
                        </Button>
                    </div>
                </form>

                <div className="mx-auto max-w-3xl rounded-2xl border border-guest-border bg-white shadow-sm">
                    <div className="border-b border-guest-border px-5 py-3">
                        <h3 className="text-sm font-bold text-guest-text">Riwayat upgrade</h3>
                    </div>
                    <ul className="divide-y divide-guest-border">
                        {history.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-guest-muted">Belum ada riwayat upgrade paket.</li>
                        )}
                        {history.map((row) => (
                            <li key={row.invoice_code} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                                <div>
                                    <span className="font-semibold text-guest-text">{row.target_label}</span>
                                    <span className="ml-2 text-xs text-guest-muted">{row.status}</span>
                                </div>
                                <span className="font-medium text-guest-text">{formatRp(row.amount)}</span>
                                <span className="text-xs text-guest-muted">{row.created_at}</span>
                                <Link
                                    href={route('member.packages.show', row.invoice_code)}
                                    className="text-xs font-bold text-store-accent-dark hover:underline"
                                >
                                    Detail
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </MemberLayout>
    );
}
