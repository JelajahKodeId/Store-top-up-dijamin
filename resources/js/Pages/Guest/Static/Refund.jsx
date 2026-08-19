import { Head } from '@inertiajs/react';

export default function Refund() {
    return (
        <>
            <Head title="Kebijakan Refund" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-soft sm:p-10">
                    <h1 className="mb-8 text-3xl font-extrabold text-store-accent">Kebijakan Pengembalian Dana (Refund Policy)</h1>
                    <div className="prose prose-invert max-w-none text-guest-text prose-headings:text-store-accent prose-a:text-store-primary">
                        <p>Terakhir Diperbarui: 19 Agustus 2026</p>

                        <h2 className="mt-8 text-xl font-bold">1. Ketentuan Umum</h2>
                        <p>
                            Mengingat produk yang kami jual adalah produk digital (in-game item/currency), maka semua transaksi yang sudah berhasil diproses <strong>TIDAK DAPAT DIBATALKAN ATAU DIKEMBALIKAN</strong> (Non-refundable) dengan alasan apapun.
                        </p>

                        <h2 className="mt-8 text-xl font-bold">2. Kesalahan Pengguna</h2>
                        <p>
                            Kami tidak bertanggung jawab atas kesalahan pengisian ID Game, Zone ID, atau Server yang dilakukan oleh pelanggan. Apabila top-up berhasil masuk ke akun yang salah karena kelalaian input, dana tidak dapat di-refund. Harap periksa kembali data Anda sebelum melakukan pembayaran.
                        </p>

                        <h2 className="mt-8 text-xl font-bold">3. Kasus Khusus yang Mendapat Refund</h2>
                        <p>
                            Refund atau Pengembalian Dana hanya dapat dilakukan apabila memenuhi kondisi berikut:
                        </p>
                        <ul>
                            <li>Pelanggan telah berhasil melakukan pembayaran, namun stok produk kosong atau sedang gangguan sistem dari pihak pusat.</li>
                            <li>Sistem kami gagal memproses pesanan Anda dalam waktu maksimal 1x24 jam sejak pembayaran berhasil dikonfirmasi, dan pelanggan meminta pembatalan.</li>
                        </ul>

                        <h2 className="mt-8 text-xl font-bold">4. Proses Pengembalian Dana</h2>
                        <p>
                            Apabila Anda memenuhi syarat untuk Refund, Anda dapat menghubungi Customer Service kami dengan melampirkan:
                        </p>
                        <ul>
                            <li>Nomor Invoice pesanan Anda.</li>
                            <li>Bukti transfer atau mutasi pembayaran.</li>
                            <li>Nomor rekening atau e-Wallet tujuan refund (harus sesuai dengan nama pada saat checkout jika memungkinkan).</li>
                        </ul>
                        <p>
                            Proses pengembalian dana akan memakan waktu 1-3 hari kerja terhitung sejak permintaan refund kami setujui.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
