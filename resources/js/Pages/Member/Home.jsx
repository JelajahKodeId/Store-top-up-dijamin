import { Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Home({ totalOrders, account, recentOrders }) {
    return (
        <MemberLayout title="Akun Member" subtitle="Ringkasan aktivitas dan informasi akun Anda.">
            <section className="section-container space-y-8 pb-16">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-guest-border bg-guest-surface p-5 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-guest-subtle">Total Pesanan</p>
                        <p className="mt-2 font-bebas text-4xl font-bold text-guest-text">{totalOrders}</p>
                    </div>
                    <div className="rounded-2xl border border-guest-border bg-white p-5 shadow-sm sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-guest-subtle">Informasi Akun</p>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-guest-muted">Nama Lengkap</dt>
                                <dd className="font-semibold text-guest-text">{account.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-guest-muted">Level</dt>
                                <dd className="font-semibold text-guest-text">{account.level}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-guest-muted">No. Whatsapp</dt>
                                <dd className="font-mono text-sm font-semibold text-guest-text">{account.whatsapp || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-guest-muted">Terdaftar</dt>
                                <dd className="font-semibold text-guest-text">{account.registered_at}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="rounded-2xl border border-guest-border bg-guest-surface shadow-sm">
                    <div className="flex items-center justify-between border-b border-guest-border px-5 py-4">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-guest-text">Pembelian Terbaru</h2>
                        <Link href={route('member.orders.index')} className="text-xs font-bold uppercase tracking-wide text-store-accent-dark hover:underline">
                            Lihat semua
                        </Link>
                    </div>
                    <ul className="divide-y divide-guest-border">
                        {recentOrders.length === 0 && (
                            <li className="px-5 py-10 text-center text-sm text-guest-muted">Belum ada riwayat pembelian.</li>
                        )}
                        {recentOrders.map((row) => (
                            <li key={row.invoice} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-guest-subtle">{row.status_label}</p>
                                    <p className="font-semibold text-guest-text">{row.product}</p>
                                    <p className="text-xs text-guest-muted">{row.created_at}</p>
                                </div>
                                <Link
                                    href={route('orders.status', row.invoice)}
                                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-store-accent-dark hover:underline"
                                >
                                    Detail <AppIcons.arrowRight size={14} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </MemberLayout>
    );
}
