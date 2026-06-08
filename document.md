# Dokumentasi Program - Store Top-Up Dijamin

Dokumen ini berfungsi sebagai panduan teknis bagi developer untuk memahami, memodifikasi, dan memperbarui aplikasi Store Top-Up Dijamin. Aplikasi ini dibangun dengan mengutamakan skalabilitas, keamanan, dan real-time update.

## 1. Teknologi Utama (Tech Stack)

*   **Backend:** Laravel ^13
*   **Frontend:** React 18 menggunakan Inertia.js ^2.0
*   **CSS Framework:** Tailwind CSS v3
*   **Database:** MySQL
*   **Cache & Queue:** Redis (Sangat disarankan untuk cache, antrian email, dan sessions)
*   **Payment Gateway:** Pak Kasir
*   **Autentikasi & Otorisasi:** Laravel Sanctum & Spatie Laravel-Permission

## 2. Struktur Direktori Kritis

Aplikasi ini mengikuti standar struktur Laravel dengan beberapa tambahan spesifik:

*   **`app/Http/Controllers/`** - Berisi controller utama untuk memproses request. Controller untuk admin dan public dipisahkan.
*   **`app/Services/`** - Berisi *Business Logic* untuk menjaga controller tetap bersih. Contoh: `CatalogService` (untuk handle list produk), `OrderFulfillmentService` (untuk kirim key ke user setelah bayar).
*   **`app/Models/`** - Definisi skema dan relasi antar tabel (Eloquent Models).
*   **`resources/js/Pages/`** - Berisi semua halaman Frontend React. Dibagi menjadi `Admin/` untuk panel admin dan `Guest/` untuk halaman publik.
*   **`resources/js/Components/`** - Komponen UI React yang dapat digunakan ulang (Re-usable Components) seperti Button, Modal, Card.

## 3. Alur Proses Kritis (Core Flows)

### 3.1. Alur Pemesanan & Pembayaran (Checkout)
Pemesanan menggunakan pendekatan validasi stok ketat (menggunakan `lockForUpdate()`) agar tidak terjadi kebocoran (race-condition).

1.  **User Checkout**: Pengguna memilih produk, durasi, dan memasukkan data di `resources/js/Pages/Guest/ProductDetail.jsx`.
2.  **Submit ke Backend**: Request masuk ke `CheckoutController`. Transaksi database (`DB::transaction`) dibuat:
    *   Sistem mengecek ketersediaan produk.
    *   Data pesanan (`Order`, `OrderItem`, dll) dibuat di database dengan status `pending`.
3.  **Payment Gateway API**: Sistem memanggil API Pak Kasir untuk mengenerate URL pembayaran atau kode QR.
4.  **Redirect**: User diarahkan ke halaman tunggu pembayaran (Status Order).

### 3.2. Webhook Callback (Pemrosesan setelah User Bayar)
Karena transaksi ini asinkron, Pak Kasir akan mengirimkan HTTP POST (Webhook) ke server kita saat user berhasil membayar.

1.  **Webhook Diterima**: Masuk ke rute webhook (`/webhooks/payment/pak_kasir`).
2.  **Validasi Keamanan**: Sistem memvalidasi signature dari Pak Kasir (menggunakan API Key/Secret) untuk memastikan request benar-benar dari gateway pembayaran asli.
3.  **Update Status**: Jika valid, status `Order` dan `Payment` diubah menjadi `paid`.
4.  **Dispatch Job (Queue)**: Sistem memasukkan tugas ke antrian (Queue) untuk mengeksekusi layanan `FulfillOrderJob` di latar belakang.

### 3.3. Pemenuhan Pesanan (Key Delivery)
Ketika `FulfillOrderJob` dijalankan oleh worker (contoh: `php artisan queue:work`):

1.  **Alokasi Key**: Sistem mencari key (`ProductKey`) yang tersedia sesuai ID durasi, mengubah statusnya menjadi `used`.
2.  **Assign Key ke User**: Key ditautkan dengan `order_id`.
3.  **Pengiriman Email**: Sistem memanggil `OrderNotificationService` untuk mengirimkan email berisi Detail Order dan Key kepada pembeli.

## 4. Keamanan Program

Beberapa protokol keamanan yang diterapkan untuk mencegah serangan atau bug eksploitasi:
*   **Race Condition Prevention**: Pembelian barang yang menggunakan *stok key* dipagari menggunakan fungsi database `lockForUpdate()` agar dua pembeli yang menekan tombol *beli* pada milidetik yang sama tidak mendapatkan key yang sama.
*   **Idempotency & HMAC Check**: Endpoint Webhook harus divalidasi checksum-nya. Jika webhook dari order yang sama terkirim berulang kali, program akan melewatinya.
*   **Rate Limiting**: Endpoint sensitif (`/checkout` dan webhook) dibatasi per menit via Laravel throttle.

## 5. Menambahkan Fitur Baru

Jika ingin menambahkan modul baru, ikuti kaidah ini:
1.  **Buat Migration & Model**: `php artisan make:model NamaModel -m`
2.  **Buat Controller**: `php artisan make:controller NamaModelController`
3.  **Pisahkan Logic ke Service**: Jika logic controller lebih dari 30 baris, pindahkan prosesnya ke class terpisah di dalam `app/Services/`.
4.  **Buat React Page**: Tambahkan halaman baru di `resources/js/Pages/` dan sambungkan lewat routing di `routes/web.php` menggunakan fitur `Inertia::render('Path/To/Component')`.

## 6. Update Terbaru
*   *(April 2026)*: Menghapus dependensi ke WhatsApp API/Bot Node.js (`wa-server`) untuk menyederhanakan arsitektur. Pengiriman notifikasi pembayaran berhasil dan pemberian Product Key kini murni berbasis Email yang dijalankan melalui Queue.
*   *(April 2026)*: Migrasi Payment Gateway dari Tripay ke **Pak Kasir**.
