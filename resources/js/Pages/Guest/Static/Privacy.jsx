import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Kebijakan Privasi" />
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-guest-border bg-guest-surface p-6 shadow-soft sm:p-10">
                    <h1 className="mb-8 text-3xl font-extrabold text-store-accent">Kebijakan Privasi</h1>
                    <div className="prose prose-invert max-w-none text-guest-text prose-headings:text-store-accent prose-a:text-store-primary">
                        <p>Terakhir Diperbarui: 19 Agustus 2026</p>

                        <h2 className="mt-8 text-xl font-bold">1. Pengumpulan Data</h2>
                        <p>
                            Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat melakukan pembelian, termasuk namun tidak terbatas pada:
                        </p>
                        <ul>
                            <li>ID Game / User ID</li>
                            <li>Nomor WhatsApp</li>
                            <li>Alamat Email (jika membuat akun/login)</li>
                            <li>Nama (opsional)</li>
                        </ul>

                        <h2 className="mt-8 text-xl font-bold">2. Penggunaan Data</h2>
                        <p>
                            Informasi yang kami kumpulkan digunakan untuk tujuan berikut:
                        </p>
                        <ul>
                            <li>Memproses dan menyelesaikan pesanan/top-up Anda.</li>
                            <li>Mengirimkan notifikasi tagihan atau konfirmasi transaksi via WhatsApp/Email.</li>
                            <li>Mencegah aktivitas penipuan (fraud) dan penyalahgunaan layanan.</li>
                            <li>Meningkatkan layanan dan memberikan dukungan pelanggan.</li>
                        </ul>

                        <h2 className="mt-8 text-xl font-bold">3. Pembagian Data</h2>
                        <p>
                            Kami <strong>tidak pernah menjual, menyewakan, atau menukar</strong> informasi pribadi Anda kepada pihak ketiga. Informasi Anda hanya kami bagikan kepada:
                        </p>
                        <ul>
                            <li><strong>Payment Gateway (Tripay):</strong> Untuk memproses pembayaran. Data yang dikirimkan terbatas pada nomor order, nama, dan jumlah tagihan.</li>
                            <li><strong>Provider/Supplier Game:</strong> Hanya ID Game dan Server yang dikirimkan ke server penyedia game untuk memproses top-up.</li>
                        </ul>

                        <h2 className="mt-8 text-xl font-bold">4. Keamanan Data</h2>
                        <p>
                            Kami mengimplementasikan berbagai langkah keamanan untuk menjaga keamanan informasi pribadi Anda saat Anda melakukan pemesanan. Namun, Anda harus memahami bahwa tidak ada transmisi data melalui internet yang 100% aman.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
