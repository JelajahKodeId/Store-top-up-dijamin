# Panduan Deployment — Store Top-up Dijamin

Dokumen ini mencakup langkah lengkap untuk deploy aplikasi ke server production,
mulai dari persiapan server hingga konfigurasi queue dan cron.

---

## Daftar Isi

1. [Kebutuhan Server](#1-kebutuhan-server)
2. [Persiapan Server (Ubuntu/Debian)](#2-persiapan-server-ubuntudebian)
3. [Clone & Setup Aplikasi](#3-clone--setup-aplikasi)
4. [Konfigurasi Environment (.env)](#4-konfigurasi-environment-env)
5. [Database & Storage](#5-database--storage)
6. [Build Frontend Assets](#6-build-frontend-assets)
7. [Konfigurasi Nginx](#7-konfigurasi-nginx)
8. [SSL dengan Certbot (Let's Encrypt)](#8-ssl-dengan-certbot-lets-encrypt)
9. [Queue Worker (Systemd)](#9-queue-worker-systemd)
10. [Cron Scheduler](#10-cron-scheduler)
11. [Checklist Production](#11-checklist-production)
12. [Perintah Berguna](#12-perintah-berguna)
13. [Rollback Procedure](#13-rollback-procedure)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Kebutuhan Server

| Komponen       | Minimum               | Direkomendasikan       |
|----------------|-----------------------|------------------------|
| OS             | Ubuntu 22.04 LTS      | Ubuntu 24.04 LTS       |
| PHP            | 8.3+                  | 8.3+ (dengan OPcache)  |
| MySQL          | 8.0+                  | 8.0+ atau MariaDB 10.6 |
| Node.js        | 20+                   | 20 LTS                 |
| Composer       | 2.x                   | 2.x                    |
| RAM            | 1 GB                  | 2 GB+                  |
| Disk           | 5 GB                  | 20 GB+                 |
| Redis          | Opsional              | Sangat disarankan       |

### PHP Extensions yang Dibutuhkan

```
php8.3-cli php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml
php8.3-bcmath php8.3-curl php8.3-zip php8.3-intl php8.3-gd
php8.3-redis (jika pakai Redis)
```

---

## 2. Persiapan Server (Ubuntu/Debian)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y git curl unzip nginx mysql-server

# Install PHP 8.3
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring \
    php8.3-xml php8.3-bcmath php8.3-curl php8.3-zip php8.3-intl php8.3-gd

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# (Opsional tapi sangat disarankan) Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 3. Clone & Setup Aplikasi

```bash
# Buat user khusus aplikasi (opsional tapi disarankan)
sudo useradd -m -s /bin/bash storeapp
sudo su - storeapp

# Atau langsung di www-data / direktori web:
cd /var/www

# Clone repository
git clone https://github.com/YOUR_USERNAME/store-top-up-dijamin.git store
cd store

# Install PHP dependencies (tanpa dev dependencies)
composer install --optimize-autoloader --no-dev

# Install Node dependencies (hanya untuk build)
npm ci

# Set permission
sudo chown -R www-data:www-data /var/www/store
sudo chmod -R 755 /var/www/store
sudo chmod -R 775 /var/www/store/storage
sudo chmod -R 775 /var/www/store/bootstrap/cache
```

---

## 4. Konfigurasi Environment (.env)

```bash
# Salin template
cp .env.example .env

# Generate application key
php artisan key:generate

# Edit file .env
nano .env
```

### Nilai wajib di-set untuk production:

```env
APP_NAME="Nama Store Anda"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_store_topup
DB_USERNAME=store_user
DB_PASSWORD=STRONG_PASSWORD_HERE

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_DOMAIN=yourdomain.com

QUEUE_CONNECTION=database
CACHE_STORE=database

# Redis (disarankan di production — lihat bagian "Redis" di bawah):
# REDIS_CLIENT=predis
# CACHE_STORE=redis
# QUEUE_CONNECTION=redis
# SESSION_DRIVER=redis
# SESSION_CONNECTION=session

# Payment Gateway
TRIPAY_API_KEY=isi_dengan_api_key_merchant
TRIPAY_PRIVATE_KEY=isi_dengan_private_key
TRIPAY_MERCHANT_CODE=isi_dengan_kode_merchant
TRIPAY_MODE=production

# WhatsApp (wa-server — lihat checklist & wa-server/README.md)
WA_SERVER_URL=http://127.0.0.1:3000
WHATSAPP_SERVER_SECRET=
WA_ADMIN_NUMBER=628xxxxxxxxxx

EMAIL_NOTIFICATIONS_ENABLED=false
```

### Redis di Laravel (mengapa & cara pakai)

**Apa itu Redis?** Database in-memory berbasis key–value. Baca/tulis jauh lebih cepat daripada MySQL untuk data sementara (cache, antrian, session).

**Di project ini Redis berguna untuk:**

| Penggunaan | Manfaat |
|------------|---------|
| **Cache** (`CACHE_STORE=redis`) | `Cache::remember` untuk channel Tripay & setting site tidak membebani MySQL; TTL otomatis. |
| **Queue** (`QUEUE_CONNECTION=redis`) | Job (notifikasi, tugas latar belakang) tidak mengisi tabel `jobs` dan lebih ringan saat traffic naik. |
| **Session** (`SESSION_DRIVER=redis` + `SESSION_CONNECTION=session`) | Kurangi write session ke DB; cocok untuk banyak admin login bersamaan. |

**Konfigurasi logical database** (satu instance Redis, index berbeda): `REDIS_DB=0` (antrian & default), `REDIS_CACHE_DB=1` (cache), `REDIS_SESSION_DB=2` (session). Nama koneksi session mengacu ke `config/database.php` → kunci `session`.

**Client PHP:** paket `predis/predis` sudah ada di `composer.json` (`REDIS_CLIENT=predis`). Di server production bisa pasang ekstensi `phpredis` dan set `REDIS_CLIENT=phpredis` untuk performa sedikit lebih baik.

**Setelah ubah `.env`:** `php artisan config:cache` dan pastikan worker antrian tetap jalan (`php artisan queue:work` atau systemd seperti di panduan ini).

### Setup Database MySQL

```sql
-- Jalankan sebagai root MySQL:
CREATE DATABASE db_store_topup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'store_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON db_store_topup.* TO 'store_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 5. Database & Storage

```bash
# Jalankan semua migrasi
php artisan migrate --force

# Seed data awal (roles, admin, settings dasar)
# PERHATIAN: Jangan jalankan seed di production jika sudah ada data!
# Hanya untuk fresh install:
php artisan db:seed --class=RolePermissionSeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=SettingSeeder --force

# Buat symlink storage ke public
php artisan storage:link

# Optimize aplikasi Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear cache lama jika re-deploy
# php artisan optimize:clear && php artisan optimize
```

---

## 6. Build Frontend Assets

```bash
# Build untuk production (minified, hashed filenames)
npm run build

# Pastikan folder public/build ada dan berisi file
ls -la public/build/
```

---

## 7. Konfigurasi Nginx

Buat file konfigurasi Nginx:

```bash
sudo nano /etc/nginx/sites-available/store-topup
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP ke HTTPS (aktifkan setelah SSL terpasang)
    # return 301 https://$host$request_uri;

    root /var/www/store/public;
    index index.php;

    # Charset
    charset utf-8;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml;
    gzip_vary on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;

        # Timeout untuk request yang berat
        fastcgi_read_timeout 60;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Upload limit
    client_max_body_size 10M;
}
```

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/store-topup /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 8. SSL dengan Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan sertifikat SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot akan otomatis mengubah konfigurasi Nginx untuk HTTPS.
# Setelah selesai, uncomment redirect HTTP→HTTPS di konfigurasi Nginx.

# Auto-renewal (sudah otomatis dengan systemd timer)
sudo systemctl status certbot.timer
```

---

## 9. Queue Worker (Systemd)

Laravel Queue digunakan untuk proses background (notifikasi WA, dsb).

```bash
sudo nano /etc/systemd/system/store-queue.service
```

```ini
[Unit]
Description=Store Top-up Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
RestartSec=5
WorkingDirectory=/var/www/store
ExecStart=/usr/bin/php artisan queue:work database \
    --sleep=3 \
    --tries=3 \
    --max-time=3600 \
    --memory=128
StandardOutput=append:/var/log/store-queue.log
StandardError=append:/var/log/store-queue.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable store-queue
sudo systemctl start store-queue
sudo systemctl status store-queue
```

---

## 10. Cron Scheduler

Laravel Scheduler untuk tugas terjadwal (cleanup order expired, dsb):

```bash
sudo crontab -u www-data -e
```

Tambahkan baris:

```cron
* * * * * cd /var/www/store && php artisan schedule:run >> /dev/null 2>&1
```

---

## 11. Checklist Production

Jalankan semua item ini sebelum go-live:

### Aplikasi
- [ ] `APP_DEBUG=false` di `.env`
- [ ] `APP_ENV=production` di `.env`
- [ ] `APP_URL` sudah diisi dengan domain HTTPS
- [ ] `APP_KEY` sudah di-generate (`php artisan key:generate`)
- [ ] `SESSION_ENCRYPT=true` di `.env`
- [ ] `LOG_LEVEL=error` di `.env`

### Payment Gateway (Tripay)
- [ ] `TRIPAY_MODE=production`
- [ ] `TRIPAY_API_KEY`, `TRIPAY_PRIVATE_KEY`, `TRIPAY_MERCHANT_CODE` sudah diisi
- [ ] `callback_url` dapat diakses dari internet (bukan localhost)
- [ ] Uji dengan transaksi kecil di sandbox sebelum production

### WhatsApp
- [ ] `wa-server/` berjalan (Node); `WA_SERVER_URL` & `WHATSAPP_SERVER_SECRET` di `.env` Laravel; secret sama di wa-server.
- [ ] Scan QR di **Admin → WhatsApp**; status **ready**.
- [ ] Nomor admin notifikasi: Pengaturan Situs → WhatsApp atau `WA_ADMIN_NUMBER`.

### Database
- [ ] Migrasi sudah dijalankan (`php artisan migrate --force`)
- [ ] Backup database sudah terjadwal
- [ ] User DB bukan `root`, punya hak minimal yang dibutuhkan

### Server
- [ ] SSL/HTTPS aktif dan redirect HTTP→HTTPS
- [ ] Firewall: hanya buka port 80, 443, 22
- [ ] File permission: `storage/` dan `bootstrap/cache/` writable oleh `www-data`
- [ ] Storage symlink aktif (`php artisan storage:link`)

### Optimasi Laravel
- [ ] `php artisan optimize` (config + route + view cache)
- [ ] OPcache PHP aktif di `php.ini`
- [ ] Queue worker berjalan (cek: `systemctl status store-queue`)
- [ ] Cron scheduler aktif (cek: `crontab -u www-data -l`)

### Security
- [ ] `.env` tidak dapat diakses dari browser (Nginx sudah deny `/.env`)
- [ ] `APP_DEBUG=false` (tidak ada stack trace di browser)
- [ ] Header security aktif di Nginx (X-Frame-Options, dsb)

---

## 12. Perintah Berguna

```bash
# Masuk maintenance mode
php artisan down --message="Sedang maintenance. Kembali dalam 5 menit." --retry=300

# Keluar maintenance mode
php artisan up

# Clear semua cache
php artisan optimize:clear

# Re-cache untuk production
php artisan optimize

# Lihat log real-time
tail -f storage/logs/laravel.log

# Restart queue worker setelah deploy
sudo systemctl restart store-queue

# Lihat antrian job yang gagal
php artisan queue:failed

# Retry semua job yang gagal
php artisan queue:retry all

# Flush semua job yang gagal
php artisan queue:flush

# Cek status migrasi
php artisan migrate:status

# Lihat route yang terdaftar
php artisan route:list --compact
```

---

## 13. Rollback Procedure

Jika terjadi masalah setelah deploy:

```bash
# 1. Aktifkan maintenance mode
php artisan down

# 2. Kembali ke commit sebelumnya
git log --oneline -5        # lihat commit history
git checkout COMMIT_HASH    # rollback ke commit tertentu

# 3. Jika ada migrasi yang perlu di-rollback
php artisan migrate:rollback --step=1

# 4. Re-install dependencies jika composer.json berubah
composer install --optimize-autoloader --no-dev

# 5. Re-build assets jika package.json berubah
npm ci && npm run build

# 6. Clear dan re-cache
php artisan optimize:clear
php artisan optimize

# 7. Restart queue
sudo systemctl restart store-queue

# 8. Keluar maintenance mode
php artisan up
```

---

## 14. Troubleshooting

### Error 500 setelah deploy
```bash
# Periksa log Laravel
tail -100 storage/logs/laravel.log

# Pastikan permission storage benar
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Clear cache
php artisan optimize:clear
```

### Webhook Tripay tidak diterima
- Pastikan `APP_URL` di `.env` sudah HTTPS dan bisa diakses dari internet
- Cek log: `tail -f storage/logs/laravel.log | grep -i webhook`
- Pastikan route `/webhooks/payment` tidak diblokir firewall
- Verifikasi `TRIPAY_PRIVATE_KEY` sama dengan yang di dashboard Tripay

### WhatsApp tidak terkirim
- Cek proses Node (`wa-server`); `curl -s -H "Authorization: Bearer SECRET" http://127.0.0.1:3000/status` harus JSON; status **ready** setelah scan QR di admin.
- Log Laravel: `grep -i whatsapp storage/logs/laravel.log`; format nomor `628xxxx`.
- `WA_SERVER_URL` dari sisi PHP (`www-data`) harus mencapai Node (localhost atau IP internal).

### Queue tidak berjalan
```bash
sudo systemctl status store-queue
sudo journalctl -u store-queue -n 50
sudo systemctl restart store-queue
```

### Storage/gambar tidak muncul
```bash
# Pastikan symlink ada
ls -la public/storage

# Jika tidak ada, buat ulang
php artisan storage:link
```

---

*Dokumen ini dibuat untuk Store Top-up Dijamin. Perbarui sesuai perubahan infrastruktur.*
