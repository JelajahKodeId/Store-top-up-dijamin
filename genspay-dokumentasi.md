ase URLProduction

https://genspay.my.id/api/v1

1. Dapatkan API Key

API Key adalah kunci rahasia untuk mengakses seluruh endpoint pembayaran. Setiap project punya API Key sendiri.

Cara mendapatkan:

    Buka halaman Dashboard
    Tap menu Project
    Buat project baru (nama bebas, terserah kamu)
    Salin API Key yang muncul

warning
Penting! API Key bersifat rahasia. Jangan bagikan ke siapa pun. Jika bocor, regenerate lewat bot dengan perintah /regenerate_key
2. Autentikasi

Semua endpoint membutuhkan API Key yang dikirim melalui header:

X-API-Key: YOUR_API_KEY

Wajib dikirim di setiap request. Tanpa header ini, kamu akan mendapat error 401.
POST
/transaction/create
Buat Pembayaran QRIS

Membuat transaksi pembayaran menggunakan QRIS. Cocok untuk pembayaran via e-wallet/m-banking.
Parameter Request
Parameter	Tipe	Required	Deskripsi
amount	integer	check_circle	Nominal pembayaran dalam Rupiah. Min: Rp 1.000, Max: Rp 10.000.000
order_id	string	check_circle	ID unik dari merchant. Format: alfanumerik, dash, underscore. Maks 50 karakter. Contoh: INV-001
payment_method	string	radio_button_unchecked	Metode pembayaran. Default: "qris". Opsi: "qris" | "usdt_bsc"
Contoh Request

curl -X POST https://genspay.my.id/api/v1/transaction/create   -H "Content-Type: application/json"   -H "X-API-Key: YOUR_API_KEY"   -d '{
    "amount": 15000,
    "order_id": "INV-001",
    "payment_method": "qris"
  }'

Response Sukses (201)

{
  "success": true,
  "data": {
    "order_id": "INV-001",
    "amount": 15000,
    "fee": 355,
    "net_amount": 14645,
    "payment_method": "qris",
    "qr_string": "00020101021226690012...",
    "expiry_time": "2026-07-01T09:18:37.000Z"
  }
}

Error Responses
400 — Validasi gagal

{
  "error": "Amount must be integer"
}

400 — Amount terlalu kecil

{
  "error": "Minimum amount is Rp 1.000"
}

400 — Order ID tidak valid

{
  "error": "Order ID must be alphanumeric with dashes/underscores"
}

401 — API Key tidak valid

{
  "error": "Invalid or inactive API key"
}

401 — API Key tidak dikirim

{
  "error": "API key required in X-API-Key header"
}

401 — Akun merchant dinonaktifkan

{
  "error": "Merchant account is disabled"
}

409 — Order ID duplikat

{
  "error": "Order ID already exists for this project"
}

503 — Gateway bermasalah

{
  "error": "Payment gateway temporarily unavailable"
}

POST
/transaction/create
Buat Pembayaran USDT BSC (Crypto)

Membuat transaksi pembayaran menggunakan USDT di jaringan BSC (BEP20). Pembeli mengirim USDT ke alamat wallet yang diberikan.
info
Minimum amount: Rp 339.252 (termasuk fee). Ini adalah minimum untuk konversi IDR → USDT BSC.
Parameter Request
Parameter	Tipe	Required	Deskripsi
amount	integer	check_circle	Nominal dalam Rupiah. Minimal Rp 338.802 (agar amount + fee >= Rp 339.252). Maks: Rp 10.000.000
order_id	string	check_circle	ID unik dari merchant. Format: alfanumerik, dash, underscore. Maks 50 karakter. Contoh: INV-002
payment_method	string	radio_button_unchecked	WAJIB diisi "usdt_bsc" untuk crypto
Contoh Request

curl -X POST https://genspay.my.id/api/v1/transaction/create   -H "Content-Type: application/json"   -H "X-API-Key: YOUR_API_KEY"   -d '{
    "amount": 340000,
    "order_id": "INV-002",
    "payment_method": "usdt_bsc"
  }'

Response Sukses (201)

{
  "success": true,
  "data": {
    "order_id": "INV-002",
    "amount": 340450,
    "fee": 2150,
    "net_amount": 340000,
    "payment_method": "usdt_bsc",
    "pay_address": "0x656fFf2e0b34e1b929236A38D7677C9D102De8AE",
    "pay_amount": "19.76",
    "pay_currency": "USDTBSC",
    "payment_id": 5210439943,
    "expiry_time": "2026-07-17T20:17:01.680Z"
  }
}

warning
Perhatikan: Pembeli harus mengirim USDT (BEP20) ke pay_address dengan jumlah pay_amount yang tertera. Gunakan jaringan BSC (BEP20), bukan jaringan lain.
Error Responses
400 — Di bawah minimum

{
  "error": "Minimum amount for USDT BSC is Rp 339.252"
}

Error lainnya sama dengan QRIS (400 validasi, 401 API Key, 409 duplikat, 503 gateway).
GET
/transaction/{order_id}/status
Cek Status Pembayaran

Cek status transaksi berdasarkan Order ID. Bisa dicek kapan saja setelah transaksi dibuat.
Parameter Path
Parameter	Tipe	Required	Deskripsi
order_id	string	check_circle	Order ID dari merchant (sama seperti waktu create)
Contoh Request

curl -X GET https://genspay.my.id/api/v1/transaction/INV-001/status   -H "X-API-Key: YOUR_API_KEY"   -H "X-Timestamp: 1723708800"   -H "X-Signature: <hex hmac-sha256>"

Cara Menghitung X-Signature

Endpoint status mewajibkan 2 header tambahan untuk keamanan:
Header	Keterangan
X-Timestamp	Unix timestamp (detik) saat request dibuat. Toleransi selisih maksimal 5 menit dari waktu server.
X-Signature	HMAC-SHA256 dari string <code className="text-[10px] text-text-primary font-mono">"<order_id>:<X-Timestamp>"</code> menggunakan API Key sebagai secret, hasilnya hex.

// Node.js (TypeScript/JavaScript)
import crypto from 'crypto';

const timestamp = Math.floor(Date.now() / 1000);          // detik
const orderId = 'INV-001';
const apiKey = 'YOUR_API_KEY';

const payload = orderId + ':' + timestamp;
const signature = crypto
  .createHmac('sha256', apiKey)
  .update(payload)
  .digest('hex');

// Header yang dikirim:
//   X-API-Key: YOUR_API_KEY
//   X-Timestamp: <timestamp>
//   X-Signature: <signature>

lightbulb
Penting X-Timestamp harus di-generate tepat sebelum request dikirim. Jangan di-cache — jika sudah lewat 5 menit, request ditolak (401 Invalid or expired timestamp).
Response Sukses (200)

{
  "transaction": {
    "order_id": "INV-001",
    "amount": 15000,
    "project": "my-project",
    "status": "completed",
    "payment_method": "qris",
    "fee": 355,
    "created_at": "2026-07-01T08:18:37.000Z",
    "completed_at": "2026-07-01T08:20:00.000Z"
  }
}

Status Transaksi
pending— Menunggu pembayaran
completed— Pembayaran berhasil
failed— Pembayaran gagal
expired— Waktu habis
Error Responses
401 — API Key tidak valid

{
  "error": "Invalid or inactive API key"
}

404 — Transaksi tidak ditemukan

{
  "error": "Transaction not found"
}

POST
/transaction/cancel/{order_id}
Batalkan Transaksi

Membatalkan transaksi yang masih berstatus PENDING. Transaksi yang sudah SUCCESS / FAILED / EXPIRED tidak bisa dibatalkan.
Contoh Request

curl -X POST https://genspay.my.id/api/v1/transaction/cancel/INV-001   -H "X-API-Key: YOUR_API_KEY"

Response Sukses (200)

{
  "success": true,
  "data": {
    "order_id": "INV-001",
    "status": "FAILED",
    "message": "Transaction cancelled successfully"
  }
}

Error Responses
400 — Bukan PENDING

{
  "error": "Only pending transactions can be cancelled"
}

404 — Tidak ditemukan

{
  "error": "Transaction not found"
}

7. Webhook Notifikasi

Saat transaksi berubah status (menjadi SUCCESS / EXPIRED / FAILED), GensPay akan otomatis mengirim notifikasi ke Webhook URL yang kamu daftarkan di menu Project.
POST ke webhook URL project kamu
Header

X-GensPay-Signature: <sha256(JSON.stringify(body) + YOUR_API_KEY)>

Payload

{
  "event": "transaction.updated",
  "data": {
    "order_id": "INV-001",
    "amount": 15000,
    "fee": 355,
    "provider_fee": 105,
    "net_amount": 14645,
    "status": "SUCCESS",
    "payment_type": "qris",
    "payment_amount": 15000,
    "qr_string": "000201010212...",
    "created_at": "2026-07-01T08:18:37.000Z",
    "held_until": "2026-07-03T08:18:37.000Z"
  },
  "timestamp": "2026-07-01T08:19:00.000Z"
}

Cara Verifikasi Signature

Kamu harus memverifikasi signature untuk memastikan webhook benar-benar dari GensPay. Cara:

    Ambil raw body (JSON string)
    Gabungkan dengan API Key kamu: bodyString + apiKey
    Hash dengan SHA-256
    Bandingkan dengan header X-GensPay-Signature

Contoh verifikasi (JavaScript):

const crypto = require('crypto');

function verifyWebhook(body, signature, apiKey) {
  const payload = JSON.stringify(body) + apiKey;
  const hash = crypto.createHash('sha256')
    .update(payload)
    .digest('hex');
  return hash === signature;
}

// Usage di Express:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-genspay-signature'];
  const isValid = verifyWebhook(
    req.body,
    signature,
    'YOUR_API_KEY'
  );
  if (!isValid) return res.status(401).end();
  res.status(200).end();
});

Contoh verifikasi (PHP):

function verifyWebhook($body, $signature, $apiKey) {
  $payload = json_encode($body) . $apiKey;
  $hash = hash('sha256', $payload);
  return hash_equals($hash, $signature);
}

lightbulb
Penting! Server kamu harus mengembalikan response 200 OK atau 2xx. Jika gagal, GensPay akan mencoba ulang hingga 5 kali dengan jeda exponential backoff.
8. Struktur Fee

Berikut detail fee untuk setiap metode pembayaran:
QRIS
Komponen	Besaran	Keterangan
GensPay Fee	Rp 250	Fee tetap per transaksi
Provider Fee	0,7% × amount	Fee dari provider, dibulatkan ke atas
Total Fee	Rp 250 + (0,7% × amount)	Ditanggung merchant atau buyer tergantung fee mode
USDT BSC
Komponen	Besaran	Keterangan
GensPay Fee	Rp 450	Fee tetap per transaksi
Provider Fee	0,5% × amount	Fee dari provider, dibulatkan ke atas
Total Fee	Rp 450 + (0,5% × amount)	Selalu ditanggung buyer
Min / Max Transaksi
Metode	Minimum	Maksimum
QRIS	Rp 1.000	Rp 10.000.000
USDT BSC	Rp 339.252 (termasuk fee)	Rp 10.000.000
Fee Mode (khusus QRIS)

MERCHANT_PAY_FEE — Merchant menanggung fee. Buyer bayar tepat amount.

BUYER_PAY_FEE — Buyer menanggung fee. Merchant terima full amount.

Untuk USDT BSC, fee selalu ditanggung buyer.
9. Kode Error

Daftar lengkap error yang mungkin muncul:
HTTP Status	Error Message	Penyebab
400	Amount must be integer	Amount bukan angka bulat
400	Minimum amount is Rp 1.000	Amount < Rp 1.000
400	Maximum amount is Rp 10.000.000	Amount > Rp 10.000.000
400	Order ID must be alphanumeric...	Order ID mengandung karakter terlarang
400	Order ID must be at most 50 characters	Order ID > 50 karakter
400	Minimum amount for USDT BSC is Rp 339.252	Amount + fee < minimum USDT BSC
400	Only pending transactions can be cancelled	Transaksi sudah SUCCESS/FAILED/EXPIRED
401	API key required in X-API-Key header	Header X-API-Key tidak dikirim
401	Invalid or inactive API key	API Key salah atau project dinonaktifkan
401	Merchant account is disabled	Akun Telegram merchant dinonaktifkan
401	Signature required (X-Timestamp + X-Signature headers)	Header X-Timestamp / X-Signature tidak dikirim (khusus endpoint status)
401	Invalid or expired timestamp	X-Timestamp tidak valid / selisih > 5 menit (khusus endpoint status)
401	Invalid signature	X-Signature tidak cocok dengan perhitungan HMAC-SHA256 (khusus endpoint status)
404	Transaction not found	Order ID tidak ditemukan
409	Order ID already exists for this project	Order ID sudah pernah dipakai
429	Too many requests, please try again later	Rate limit terlampaui
503	Payment gateway temporarily unavailable	Provider pembayaran sedang bermasalah
10. Rate Limits

Untuk menjaga stabilitas sistem, setiap API Key memiliki batas request:
Endpoint	Limit	Window
/transaction/create	100 request	1 menit
/transaction/*/status	100 request	1 menit
/transaction/cancel/*	100 request	1 menit
Webhook (dari GensPay)	200 request	1 menit

Jika terlampaui, kamu akan menerima response 429 Too Many Requests. Cek header X-RateLimit-Remaining untuk sisa kuota.
11. Troubleshooting
help
Transaksi USDT BSC error "amountTo is too small" Amount yang kamu kirim (ditambah fee Rp 450) kurang dari minimum Rp 339.252. Gunakan amount minimal Rp 338.802.
help
Webhook tidak diterima Pastikan server kamu mengembalikan response 2xx. GensPay akan mencoba ulang hingga 5 kali dengan jeda: 2s, 4s, 8s, 16s, 32s.
help
API Key error "Invalid or inactive" Cek apakah API Key benar dan project masih aktif. Jika perlu, regenerate key lewat bot Telegram.
help
Pembayaran QRIS tidak muncul QRIS string bisa discan menggunakan aplikasi Gojek, OVO, Dana, atau m-banking yang mendukung QRIS.