import { Link } from '@inertiajs/react';
import MemberLayout from '@/Layouts/MemberLayout';
import Pagination from '@/Components/ui/Pagination';
import { AppIcons } from '@/Components/shared/AppIcon';

export default function Orders({ orders }) {
    return (
        <MemberLayout title="Pesanan Saya" subtitle="Riwayat pembelian top up / produk digital Anda.">
            <section className="section-container space-y-6 pb-16">
                <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface shadow-sm">
                    <div className="hidden grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b border-guest-border bg-guest-elevated px-5 py-3 text-[10px] font-black uppercase tracking-widest text-guest-subtle md:grid">
                        <span>Produk</span>
                        <span>Status</span>
                        <span>Tanggal</span>
                        <span className="text-right">Aksi</span>
                    </div>
                    <ul className="divide-y divide-guest-border">
                        {orders.data.length === 0 && (
                            <li className="px-5 py-12 text-center text-sm text-guest-muted">Belum ada pesanan.</li>
                        )}
                        {orders.data.map((row) => (
                            <li key={row.invoice} className="px-5 py-4">
                                <div className="flex flex-col gap-3 md:grid md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center md:gap-4">
                                    <div>
                                        <p className="font-semibold text-guest-text">{row.product}</p>
                                        <p className="font-mono text-[11px] text-guest-muted">{row.invoice}</p>
                                    </div>
                                    <div>
                                        <span className="inline-flex rounded-full bg-guest-elevated px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-guest-text">
                                            {row.status_label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-guest-muted">{row.created_at}</p>
                                    <div className="md:text-right">
                                        <Link
                                            href={row.href}
                                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-store-accent-dark hover:underline"
                                        >
                                            Lacak <AppIcons.arrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination links={orders.links} />
                </div>
            </section>
        </MemberLayout>
    );
}
