# Rencana Arsitektur & Keamanan Web Top-Up Game
**Versi 2 — Analisis Ulang & Roadmap Implementasi Penuh**
*Diperbarui: April 2026*

Dokumen ini adalah perancangan arsitektur, teknologi, dan keamanan untuk mengembangkan website Top-Up Game (seperti Mall Store) yang berfokus pada **Security, Real-time Processing, dan Fleksibilitas Payment Gateway**.

---

## 1. Stack Teknologi Utama (Technology Stack)

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Backend Framework | Laravel | ^13 |
| Frontend | React via Inertia.js | 18 / ^2 |
| CSS | Tailwind CSS | v3 |
| Database | MySQL / PostgreSQL (InnoDB) | — |
| Cache & Queue | Redis | — |
| Real-time | Laravel Reverb (WebSocket) | *(belum install)* |
| Role & Permission | Spatie laravel-permission | ^7 |
| Payment Gateway | Tripay / Midtrans / Xendit | *(belum terintegrasi)* |

---

## 2. Analisis Status Proyek (Current State)

### ✅ Sudah Selesai Diimplementasikan

#### Backend
- [x] Migrasi database lengkap: `users`, `products`, `product_durations`, `product_fields`, `product_keys`, `orders`, `order_items`, `order_field_values`, `order_keys`, `payments`, `vouchers`, `banners`, `settings`
- [x] Model Eloquent semua entitas + relasi
- [x] Enum `OrderStatus` dan `PaymentStatus`
- [x] Spatie Permission (roles: `admin`, user biasa)
- [x] Autentikasi lengkap (login, register, lupa password, verifikasi email)
- [x] `CatalogService` — produk & banner aktif untuk halaman publik
- [x] `OrderNotificationService` — notifikasi email per status order via queue
- [x] `CheckoutController` — validasi, DB transaction, buat order + items + field values
- [x] Admin CRUD: User, Product (+ Durations, Fields, Keys), Order, Voucher, Banner, Setting
- [x] `OrderObserver` — lifecycle hook order
- [x] Mail classes untuk notifikasi order

#### Frontend (React / Inertia)
- [x] Halaman Guest: Home, Catalog, ProductDetail, TrackInvoice
- [x] Halaman Admin: Dashboard, Profile, Users, Products, Product Keys, Orders, Vouchers, Banners, Settings
- [x] Layout: `AuthenticatedLayout` (admin), `GuestNavbar`, `GuestFooter`
- [x] UI Components: Button, Input, Card, Alert, Badge, Avatar, Spinner, Pagination, Breadcrumbs, Modal, AdminTable, DeleteConfirmModal
- [x] Shared: AppIcon, AppLogo, ProductCard

---

### ✅ Sprint April 2026 — Selesai Diimplementasikan

| # | Fitur | Status | Keterangan |
|---|-------|--------|------------|
| 1 | **Halaman Checkout (Frontend)** | ✅ Selesai | `ProductDetail.jsx` + form name/email/whatsapp/voucher |
| 2 | **Integrasi Payment Gateway** | ✅ Selesai | `PaymentGatewayInterface` + `TripayService` + `MockPaymentService` |
| 3 | **Webhook Handler + Signature Validation** | ✅ Selesai | `WebhookController` + HMAC via `validateWebhookSignature()` |
| 4 | **Auto Key Delivery (Fulfillment)** | ✅ Selesai | `KeyDeliveryService` + `DeliverOrderKeysJob` + `lockForUpdate()` |
| 5 | **Halaman Payment Status** | ✅ Selesai | `OrderStatus.jsx` + countdown timer + polling 10 detik |
| 6 | **Halaman Order Detail (Guest)** | ✅ Selesai | `orders.status` route + `LandingController::orderStatus()` |
| 9 | **Validasi Voucher saat Checkout** | ✅ Selesai | `CheckoutController` — validasi + hitung diskon |
| 11 | **Rate Limiting** | ✅ Selesai | `throttle:checkout` (5/menit) + `throttle:60,1` webhook |
| 12 | **Email Key Delivery** | ✅ Selesai | `OrderSuccessMail` template + key codes via `orderKeys` relation |

### ❌ Masih Perlu Diimplementasikan

#### Diperlukan untuk Launch

| # | Fitur | Prioritas | Keterangan |
|---|-------|-----------|------------|
| 7 | **Real-time WebSocket (Reverb)** | 🟠 Penting | Saat ini polling 10 detik; Reverb untuk update instan |
| A | **Pasang API Key Tripay di .env** | 🔴 Kritis | `TRIPAY_API_KEY`, `TRIPAY_PRIVATE_KEY`, `TRIPAY_MERCHANT_CODE` |
| B | **Pilih Metode Bayar di Frontend** | 🔴 Kritis | UI untuk pilih QRIS/VA/dll sebelum submit checkout |
| C | **Jalankan Queue Worker** | 🔴 Kritis | `php artisan queue:work` atau Supervisor di server |

#### Nice to Have

| # | Fitur | Prioritas | Keterangan |
|---|-------|-----------|------------|
| 8 | **Customer Dashboard** | 🟡 Tambahan | Riwayat order guest (perlu auth opsional) |
| 10 | **Redis Caching Katalog** | 🟡 Tambahan | Cache produk aktif agar load cepat |

#### Fitur Tambahan (Nice to Have)

| # | Fitur | Prioritas | Keterangan |
|---|-------|-----------|------------|
| 13 | **Cek Nickname Game (API)** | 🟡 Tambahan | Validasi ID game saat checkout via API pihak ketiga |
| 14 | **Expiry Key Management** | 🟡 Tambahan | Otomatis tandai key kadaluarsa, kirim reminder |
| 15 | **Laporan & Export Admin** | 🟡 Tambahan | Export order ke CSV/Excel |
| 16 | **SEO Meta Tags** | 🟡 Tambahan | Open Graph, meta description per produk |
| 17 | **Error Monitoring (Sentry)** | 🟡 Tambahan | Pantau error real-time di production |

---

## 3. Arsitektur Detail Fitur Utama

### 3.1 Alur Key Delivery (Fulfillment Otomatis)

```
Order PAID (webhook diterima)
  ↓
Job: FulfillOrderJob (Queue Redis)
  ↓
OrderFulfillmentService::fulfill($order)
  ├── Ambil ProductKey yang available (status=available, durasi cocok)
  │     └── lockForUpdate() — cegah race condition
  ├── Update ProductKey.status = 'used', assigned_to = order_id
  ├── Buat OrderKey record
  ├── Update Order.status = 'completed'
  └── Trigger OrderNotificationService::sendKeyDelivery($order)
        └── Mail: key + instruksi pemakaian dikirim ke email customer
```

**Model ProductKey** perlu field:
- `key` (string, encrypted at rest)
- `duration_id` (FK product_durations)
- `status` (available | used | expired)
- `expired_at` (nullable, untuk key berdurasi)
- `used_at` (timestamp)

### 3.2 Alur Checkout + Payment

```
Guest → POST /checkout
  ├── Validasi input (product, durasi, fields, email customer)
  ├── DB::transaction {
  │     Cek stok key tersedia untuk durasi dipilih
  │     Buat Order (status=pending)
  │     Buat OrderItems
  │     Simpan OrderFieldValues
  │     Proses voucher jika ada
  │   }
  ├── Call Payment Gateway API → dapatkan payment_url / QR code
  ├── Simpan Payment record (gateway, reference, amount, expired_at)
  └── Redirect → /orders/{invoice}/payment
            (halaman waiting screen + QR/VA)

Payment Gateway → POST /webhooks/payment/{gateway}
  ├── Validasi Signature (HMAC-SHA256)
  ├── Cek idempotency (order sudah PAID? skip)
  ├── Update Order.status = 'paid', Payment.status = 'paid'
  ├── Dispatch FulfillOrderJob ke queue
  └── Return 200 OK
```

### 3.3 Real-time dengan Laravel Reverb

```
Frontend (React)
  └── Echo.private(`order.{invoice}`)
        .listen('OrderStatusUpdated', callback)

Backend (Event)
  └── OrderStatusUpdated implements ShouldBroadcast
        channel: PrivateChannel('order.' . $invoice)
        data: { status, message, keys (jika completed) }

Dipicu di: FulfillOrderJob setelah order completed
```

### 3.4 Struktur Route yang Perlu Ditambah

```php
// Publik
GET  /orders/{invoice}           → OrderController@show    (order detail guest)
GET  /orders/{invoice}/payment   → OrderController@payment (waiting screen)
POST /webhooks/payment/{gateway} → WebhookController@handle

// Auth (customer)
GET  /dashboard                  → DashboardController@member (riwayat order)
GET  /orders                     → CustomerOrderController@index

// Admin (sudah ada, perlu cek kelengkapan)
GET/POST /admin/products/{product}/keys  → ProductKeyController (sudah ada)
```

---

## 4. Database — Revisi & Penambahan

### Penambahan Kolom yang Diperlukan

**`product_keys`** (perlu verifikasi):
```sql
ALTER TABLE product_keys
  ADD COLUMN expired_at TIMESTAMP NULL,
  ADD COLUMN used_at TIMESTAMP NULL,
  ADD COLUMN assigned_order_id BIGINT UNSIGNED NULL FK orders.id;
```

**`orders`** (perlu verifikasi):
```sql
-- Pastikan ada kolom:
customer_name, customer_email, customer_phone,
status (ENUM: pending|paid|processing|completed|failed|cancelled|refunded),
payment_method, voucher_id, subtotal, discount, total,
notes, completed_at, failed_at
```

**`payments`** (perlu verifikasi):
```sql
-- Pastikan ada kolom:
order_id, gateway (tripay|midtrans|xendit),
reference (nomor referensi dari gateway),
payment_url, qr_string, va_number,
amount, status, expired_at, paid_at,
raw_callback (JSON, untuk audit)
```

---

## 5. Protokol Keamanan & Finansial

### A. Database Transactions (`DB::transaction`)
Semua proses pembuatan/update order wajib dalam transaction. Jika proses gagal di tengah jalan, semua rollback otomatis.

### B. Idempotency & Webhook Security
- Cek status order sebelum proses webhook. Jika sudah `paid/completed`, abaikan.
- Validasi `HMAC-SHA256` signature di setiap webhook masuk. Tolak jika tidak cocok (return 403).
- Simpan `raw_callback` dari gateway ke tabel `payments` untuk audit trail.

### C. Rate Limiting
| Endpoint | Limit |
|----------|-------|
| `POST /checkout` | 5 req / menit / IP |
| `POST /webhooks/*` | 30 req / menit / IP |
| `GET /track-invoice/search` | 10 req / menit / IP |
| Login | 5 req / menit / IP (sudah default Laravel) |

### D. Race Conditions Guard
```php
// Saat allocate key di FulfillOrderJob
ProductKey::where('status', 'available')
          ->where('duration_id', $durationId)
          ->lockForUpdate()
          ->first();
```

### E. Enkripsi Key
- Nilai `key` di tabel `product_keys` sebaiknya dienkripsi menggunakan `encrypted` cast Laravel agar tidak terbaca langsung di DB jika terjadi SQL injection.

### F. Customer Data Protection
- Email customer di-mask di tampilan admin list: `jo**@gmail.com`
- Log akses admin ke resource sensitif (order + payment detail)

---

## 6. Roadmap Implementasi (Fase per Fase)

### Fase 1 — Checkout & Payment Foundation (Prioritas Sekarang)
**Estimasi: 3–5 hari**
- [ ] Audit & perbaiki migrasi `orders`, `payments`, `product_keys` (pastikan kolom lengkap)
- [ ] Buat `PaymentGatewayService` (interface + implementasi Tripay/Midtrans)
- [ ] Update `CheckoutController` untuk call payment gateway & simpan `Payment`
- [ ] Buat `WebhookController` + signature validator
- [ ] Buat `FulfillOrderJob` (queue) — alokasi key + update status
- [ ] Buat halaman Checkout (React): form isi data + pilih durasi + pilih metode bayar
- [ ] Buat halaman Payment Waiting (React): tampilkan QR/VA + countdown
- [ ] Buat halaman Order Detail/Success (React): tampilkan key + instruksi

### Fase 2 — Real-time & Customer Area
**Estimasi: 2–3 hari**
- [ ] Install & konfigurasi Laravel Reverb
- [ ] Buat Event `OrderStatusUpdated` (broadcast via Reverb)
- [ ] Integrasikan Laravel Echo di frontend (update UI otomatis tanpa refresh)
- [ ] Aktifkan route `/dashboard` untuk customer (riwayat order)
- [ ] Buat halaman Customer Dashboard (React)

### Fase 3 — Optimasi & Hardening
**Estimasi: 2 hari**
- [ ] Implementasi Redis caching di `CatalogService`
- [ ] Pasang Rate Limiting middleware di route kritis
- [ ] Enkripsi kolom `key` di `product_keys`
- [ ] Tambah `lockForUpdate()` di `FulfillOrderJob`
- [ ] Audit idempotency di webhook handler

### Fase 4 — Testing Komprehensif
**Estimasi: 3–4 hari**
*(Lihat bagian 7 di bawah)*

### Fase 5 — Monitoring & Production Readiness
**Estimasi: 1–2 hari**
- [ ] Pasang Sentry untuk error monitoring
- [ ] Konfigurasi queue worker supervisor (systemd/Supervisor)
- [ ] Setup Redis untuk session + queue di production
- [ ] Konfigurasi HTTPS + HSTS
- [ ] Review environment variables (tidak ada secret di kode)

---

## 7. Rencana Testing Komprehensif

### 7.1 Testing Fitur (Feature Test — PHPUnit)

| Test Case | File | Metode |
|-----------|------|--------|
| Checkout berhasil dengan stok key tersedia | `CheckoutTest.php` | POST /checkout |
| Checkout gagal jika stok habis | `CheckoutTest.php` | POST /checkout |
| Webhook valid mengubah status order ke PAID | `WebhookTest.php` | POST /webhooks/payment/tripay |
| Webhook dengan signature salah ditolak (403) | `WebhookTest.php` | POST /webhooks/payment/tripay |
| Webhook duplikat diabaikan (idempotency) | `WebhookTest.php` | POST /webhooks/payment/tripay |
| FulfillOrderJob mengalokasikan key dengan benar | `FulfillOrderJobTest.php` | dispatch job |
| FulfillOrderJob tidak double-allocate key (race condition) | `FulfillOrderJobTest.php` | concurrent dispatch |
| Email notifikasi terkirim per status order | `OrderNotificationTest.php` | Queue::fake() |
| Voucher diskon diterapkan dengan benar | `VoucherTest.php` | POST /checkout |
| Admin CRUD produk + keys | `AdminProductTest.php` | GET/POST/PATCH/DELETE |
| Admin update status order manual | `AdminOrderTest.php` | PATCH /admin/orders/{id} |
| TrackInvoice hanya tampilkan order milik email ybs | `TrackInvoiceTest.php` | GET /track-invoice/search |

### 7.2 Testing Unit (Unit Test — PHPUnit)

| Test Case | File |
|-----------|------|
| `PaymentGatewayService::createInvoice()` menghasilkan payload benar | `PaymentGatewayServiceTest.php` |
| Validasi signature HMAC benar/salah | `SignatureValidatorTest.php` |
| `OrderFulfillmentService::allocateKey()` raise exception jika stok habis | `OrderFulfillmentServiceTest.php` |
| Enum `OrderStatus` memiliki transisi yang valid | `OrderStatusTest.php` |
| `ProductKey` scope `available()` benar | `ProductKeyTest.php` |

### 7.3 Testing UI (Dusk / Manual)

| Skenario | Halaman |
|----------|---------|
| Flow lengkap: pilih produk → checkout → bayar → terima key | Guest/ProductDetail → Checkout → Payment → Order |
| Filter & search katalog produk | Guest/Catalog |
| TrackInvoice dengan nomor invoice valid | Guest/TrackInvoice |
| Login/Register/Lupa password | Auth/* |
| Admin: tambah produk baru + tambah key + lihat order | Admin/* |
| Responsif Mobile: semua halaman guest di viewport 375px | — |
| Dark mode (jika direncanakan) | — |

### 7.4 Testing Keamanan (Security Audit)

| Vektor | Yang Diuji | Tool |
|--------|-----------|------|
| **SQL Injection** | Semua input user yang masuk ke query | Manual + SQLMap |
| **XSS** | Input pada field checkout, search, komentar | Manual |
| **CSRF** | Form POST tanpa token | Browser DevTools |
| **IDOR** | Akses `/orders/{invoice}` milik orang lain | Manual |
| **Brute Force Login** | Coba 10+ percobaan login salah | Manual + Burp Suite |
| **Webhook Spoofing** | Kirim webhook tanpa/signature salah | cURL |
| **Rate Limit Bypass** | Spam POST /checkout dari berbagai IP | Burp Suite |
| **Mass Assignment** | Field tersembunyi di form checkout | Manual |
| **Exposed Env** | `/env`, `/.env`, `/.git` dapat diakses | Browser |
| **Directory Traversal** | Path di file upload/download | Manual |

---

## 8. Checklist Sebelum Go-Live

- [ ] Semua Fase 1–3 selesai diimplementasikan
- [ ] Semua feature test passing (0 failures)
- [ ] Semua security audit lolos
- [ ] Payment gateway diuji di mode sandbox (end-to-end transaksi)
- [ ] Key delivery diuji: customer benar-benar menerima email + key valid
- [ ] Rate limiting aktif di semua endpoint kritis
- [ ] `.env` tidak mengandung nilai default/test di production
- [ ] File upload dibatasi tipe & ukurannya
- [ ] Error 404/500 menampilkan halaman custom (bukan Laravel debug page)
- [ ] Queue worker berjalan stabil (Supervisor config)
- [ ] Backup database otomatis terjadwal
- [ ] SSL/HTTPS aktif, HTTP redirect ke HTTPS

---

## 9. Struktur File Rencana Tambahan (Target)

```
app/
├── Http/Controllers/
│   ├── CheckoutController.php      ✅ (perlu update untuk payment gateway)
│   ├── OrderController.php         ❌ (buat baru — order detail + payment screen)
│   └── WebhookController.php       ❌ (buat baru)
├── Jobs/
│   └── FulfillOrderJob.php         ❌ (buat baru)
├── Services/
│   ├── PaymentGatewayService.php   ❌ (buat baru — interface)
│   ├── TripayService.php           ❌ (implementasi gateway)
│   └── OrderFulfillmentService.php ❌ (buat baru)
├── Events/
│   └── OrderStatusUpdated.php      ❌ (buat baru — Reverb broadcast)
├── Mail/
│   └── KeyDeliveryMail.php         ❌ (buat baru)
resources/js/Pages/
├── Guest/
│   ├── Checkout.jsx                ❌ (buat baru)
│   ├── Payment.jsx                 ❌ (buat baru — waiting screen)
│   └── OrderDetail.jsx             ❌ (buat baru — success + key display)
└── Dashboard.jsx                   ✅ (ada, route belum terhubung)
```

---

**Kesimpulan:**
Fondasi project sudah sangat solid — database, model, admin panel, dan notifikasi sudah siap. Prioritas utama sekarang adalah **Fase 1**: menghubungkan alur Checkout → Payment Gateway → Webhook → Key Delivery, karena inilah inti bisnis website ini. Setelah itu, real-time Reverb dan hardening keamanan akan menjadikan website ini production-ready.
