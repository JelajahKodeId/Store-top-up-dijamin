# WhatsApp gateway (Node)

Sesi WhatsApp Web lewat [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js). Laravel memanggil `POST /send` untuk notifikasi order/key.

## Persyaratan

- Node.js 18+
- **Chrome untuk Puppeteer** — salah satu dari:
  1. **Disarankan:** setelah `npm install`, jalankan **`npm run setup`** (mengunduh Chrome resmi Puppeteer, ±100–200 MB), atau biarkan `postinstall` mencoba unduh otomatis.
  2. Atur **`PUPPETEER_EXECUTABLE_PATH`** di `.env` ke binary yang ada (mis. `/usr/bin/google-chrome-stable`). Chromium dari distro kadang gagal launch dengan Puppeteer; unduhan `npm run setup` biasanya lebih stabil.

## Setup (urutan)

```bash
cd wa-server
npm install
# Jika muncul error "Could not find Chrome":
npm run setup
cp .env.example .env   # opsional
```

## Variabel `.env` (wa-server)

| Variabel | Keterangan |
|----------|------------|
| `PORT` | Default `3000` |
| `WA_BIND` | Default `127.0.0.1` |
| `WHATSAPP_SERVER_SECRET` | Samakan dengan Laravel; wajib di production |
| `PUPPETEER_EXECUTABLE_PATH` | Opsional — paksa path ke Chrome/Chromium |

## Menjalankan

```bash
npm start
```

Pastikan port **tidak dipakai proses lain** (`EADDRINUSE` → hentikan proses lama atau ganti `PORT`).

Di **Admin Laravel → WhatsApp**, scan QR. Sesi tersimpan di **`.wwebjs_auth/`** (sudah di `.gitignore`).

## Production

- `systemd` atau PM2 untuk `npm start`.
- `WHATSAPP_SERVER_SECRET` + bind `127.0.0.1`.
- Setelah deploy baru: `npm install && npm run setup` di server (unduh Chrome sekali).

**Peringatan:** WhatsApp Web tidak resmi; patuhi ToS WhatsApp.
