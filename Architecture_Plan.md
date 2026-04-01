# Rencana Arsitektur & Keamanan Web Top-Up Game

Dokumen ini adalah perancangan arsitektur, teknologi, dan keamanan untuk mengembangkan website Top-Up Game (seperti Mall Store) yang berfokus pada **Security, Real-time Processing, dan Fleksibilitas Payment Gateway**.

---

## 1. Stack Teknologi Utama (Technology Stack)

Web top-up game memiliki kebutuhan kompleks karena memproses transaksi finansial H2H (Host-to-Host) dengan provider game dan payment gateway.

- **Backend Framework:** Laravel 11 (PHP 8.2+)
  - **Alasan:** Ekosistem yang matang, antarmuka ORM Eloquent yang sangat baik dalam menangani transaksi *database*, dan sistem antrean (*queue*) built-in.
- **Frontend Stack:** React.js (via Inertia.js) + Tailwind CSS v4
  - **Alasan:** Menghasilkan pengalaman Single Page Application (SPA) yang cepat tanpa perlu membangun API terpisah, sehingga performa *loading* sangat optimal untuk *user engagement*.
- **Database Utama:** MySQL / PostgreSQL (Wajib menggunakan engine InnoDB)
  - **Alasan:** Dukungan penuh terhadap konsep ACID (*Atomicity, Consistency, Isolation, Durability*) untuk mencegah rasio transaksi (*race condition*) pada saldo/pembayaran.
- **In-Memory Cache & Message Broker:** Redis
  - **Alasan:** Digunakan untuk caching harga produk (katalog game) agar loading super cepat meskipun puluhan ribu pengunjung, serta sebagai antrean (*queue*) proses webhook pembayaran.
- **Real-time Server:** Laravel Reverb (WebSockets)
  - **Alasan:** Mengirim status pembayaran (misal: "Menunggu Pembayaran" otomatis berubah menjadi "Sukses") di layar pengguna tanpa perlu me-refresh halaman (*refreshless*).

---

## 2. Kebutuhan Instalasi Package (Dibutuhkan untuk Web Top-up)

Untuk mencapai standar *store* modern, berikut daftar package/teknologi yang wajib diinstal di dalam Laravel:

1. **Broadcasting & WebSockets (`php artisan install:broadcasting`)**
   - Akan menggunakan Reverb atau Pusher. Untuk meng-update UI status pesanan secara *real-time*.
2. **Payment Gateway SDKs (HTTP Client Laravel)**
   - Integrasi ke gateway lokal seperti **Tripay, Midtrans, XenInvoice (Xendit), atau Duitku**. Tidak selalu butuh *package* pihak ketiga karena HTTP Client bawaan Laravel sudah sangat kuat untuk H2H API.
3. **Provider Game API (Digiflazz, VIP Reseller, Smile.one, dll)**
   - Menyediakan stok diamond/UC secara real-time. Dibuatkan *Service* khusus menggunakan API *call* berbasis *Signature Hashing* (MD5/SHA256).
4. **Spatie Laravel Permission (`spatie/laravel-permission`)**
   - Manajemen *Role* yang ketat: Admin, Reseller (Member Platinum/Gold), User Biasa.
5. **Laravel Telescope / Sentry (`sentry/sentry-laravel`)**
   - Monitoring error secara *real-time*. Jika ada webhook dari payment gateway yang gagal terproses, *developer* langsung mendapat notifikasi.

---

## 3. Protokol Keamanan & Finansial (Sangat Krusial)

Karena ini menyangkut uang, keamanan adalah prioritas tertinggi dibandingkan UI/UX.

### A. Database Transactions (`DB::transaction`)
Semua proses pembuatan pesanan (Order) atau pemotongan saldo (Balance) wajib berada di dalam *database transaction*.
- Jika user melakukan pesanan, lalu tiba-tiba server mati di tengah proses (sebelum data tersimpan sempurna), transaksi akan dibatalkan (*rollback*) agar *user* tidak rugi atau sistem tidak ter-eksploitasi.

### B. Idempotency & Webhook Security
- **Mencegah Double-Spend:** Saat Webhook (Callback) dari Payment Gateway masuk menyatakan "Lunas", sistem harus mengecek status order. Jika sudah "Lunas", sistem harus mengabaikan webhook duplikat tersebut.
- **Signature Validation:** Semua webhook yang masuk dari Payment Gateway / Provider Game **wajib divalidasi dengan Signature (HMAC/SHA256)**. Ini memastikan bahwa *request* lunas benar-benar datang dari Tripay/Midtrans, bukan dari *hacker* yang mencoba memalsukan status pembayaran.

### C. Rate Limiting (Throttle)
Titik masuk krusial (seperti POST Checkout, Callback API, dan Cek Nickname Game) harus dilindungi dengan Rate Limit agresif (misal: maksimal 5 request per menit per IP) agar terhindar dari *Brute-Force* dan percobaan spam transaksi jahat.

### D. Race Conditions Guard
Menggunakan penguncian level baris di *database* (`lockForUpdate()`) saat memotong saldo *Reseller* untuk mencegah user men-spam klik "Beli" secara bersamaan (sehingga bisa berbelanja melebihi saldo yang ada).

---

## 4. Alur Real-time Checkout yang Direncanakan

1. **Checkout:** User memasukkan ID Game (Dicek valid via API pihak ketiga) & memilih metode bayar QRIS.
2. **Order Generated:** Sistem menembak API Payment Gateway (Tripay), lalu mengembalikan QR Code ke browser user.
3. **Listening (Reverb):** Frontend React mulai "*mendengarkan*" (Listen) *channel* transaksi ID tersebut via WebSocket Reverb.
4. **Pembayaran (*User scans QR*):** Tripay mendeteksi uang masuk, secara asinkron (H2H) mengirim Webhook (Callback) tertutup ke server Laravel.
5. **Webhook Processing:** 
   - Server memvalidasi Signature.
   - Status Order di-update ke `PAID`.
   - Reverb mengirim sinyal (Broadcast Event `PaymentReceived`) ke browser pengguna secara instan.
   - Bersamaan dengan itu, *Job Queue* (Redis) memicu *request* (H2H) ke Digiflazz/VIP Reseller untuk Top-Up Diamond.
6. **Sukses:** Diamond masuk, status berubah menjadi `COMPLETED`, Reverb mem-broadcast update tersebut, tampilan browser User langsung berubah hijau (Sukses).

---

**Kesimpulan:** 
Dengan arsitektur React (Inertia) + Laravel 11 + Redis + Reverb, website ini tidak hanya akan setara dengan performa toko top-up raksasa, tetapi juga akan *highly-secure* dan *scalable* untuk menampung ribuan transaksi serentak setiap saat.
