import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Syarat dan Ketentuan" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-soft sm:p-10">
                    <h1 className="mb-8 text-3xl font-extrabold text-store-accent">Syarat dan Ketentuan</h1>
                    <div className="prose prose-invert max-w-none text-guest-text prose-headings:text-store-accent prose-a:text-store-primary">
                        <p>Terakhir Diperbarui: 19 Agustus 2026</p>

                        <h2 className="mt-8 text-xl font-bold">1. Pendahuluan</h2>
                        <p>
                            Selamat datang di layanan top-up game kami. Dengan mengakses atau menggunakan website kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan seluruh syarat dan ketentuan ini, maka Anda tidak diperkenankan untuk menggunakan layanan kami.
                        </p>

                        <h2 className="mt-8 text-xl font-bold">2. Layanan Kami</h2>
                        <p>
                            Kami menyediakan layanan pembelian produk digital, khususnya in-game currency (seperti diamond, UC, koin, dll) serta voucher game online. Pengiriman produk akan dilakukan secara otomatis setelah pembayaran berhasil dikonfirmasi.
                        </p>

                        <h2 className="mt-8 text-xl font-bold">3. Pembelian dan Pembayaran</h2>
                        <ul>
                            <li>Anda setuju untuk memberikan data yang akurat dan lengkap pada saat melakukan pemesanan (contoh: ID Game, Server, dsb).</li>
                            <li>Kesalahan input data (seperti salah ID) sepenuhnya menjadi tanggung jawab pelanggan dan dana tidak dapat dikembalikan.</li>
                            <li>Pembayaran harus dilakukan sesuai dengan instruksi metode pembayaran yang dipilih (QRIS, Virtual Account, e-Wallet, dll).</li>
                            <li>Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya, namun perubahan harga tidak akan memengaruhi pesanan yang sudah berhasil dibuat dan sedang menunggu pembayaran.</li>
                        </ul>

                        <h2 className="mt-8 text-xl font-bold">4. Kebijakan Privasi</h2>
                        <p>
                            Penggunaan data pribadi Anda diatur oleh <a href="/kebijakan-privasi" className="underline">Kebijakan Privasi</a> kami. Kami berkomitmen untuk menjaga keamanan dan kerahasiaan informasi Anda.
                        </p>

                        <h2 className="mt-8 text-xl font-bold">5. Penafian (Disclaimer)</h2>
                        <p>
                            Website ini tidak berafiliasi secara resmi dengan publisher game (contoh: Moonton, Tencent, Garena, dll). Segala merek dagang adalah hak milik dari masing-masing publisher/developer.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
