require('dotenv').config();

const fs = require('fs');

/**
 * Chrome untuk Puppeteer.
 * Urutan: PUPPETEER_EXECUTABLE_PATH → Chrome yang diunduh Puppeteer (npm run setup) → binary sistem (fallback).
 */
function resolveChromeExecutable() {
    const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (fromEnv && fs.existsSync(fromEnv)) {
        console.log('[wa-server] Chrome dari PUPPETEER_EXECUTABLE_PATH:', fromEnv);
        return fromEnv;
    }

    try {
        const puppeteer = require('puppeteer');
        const bundled = typeof puppeteer.executablePath === 'function' ? puppeteer.executablePath() : null;
        if (bundled && fs.existsSync(bundled)) {
            console.log('[wa-server] Chrome bundelan Puppeteer:', bundled);
            return bundled;
        }
    } catch {
        /* puppeteer opsional di level atas; whatsapp-web.js tetap membawa dependensi */
    }

    const candidates = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            console.log('[wa-server] Fallback Chrome sistem:', p, '(jika gagal launch, jalankan: npm run setup)');
            return p;
        }
    }

    console.warn('[wa-server] Chrome tidak ditemukan. Jalankan: cd wa-server && npm run setup');
    return undefined;
}

/**
 * Gateway WhatsApp self-hosted untuk Laravel Mall Store.
 *
 * Endpoint:
 *   GET  /status  — status + QR base64 (jika perlu) + info client
 *   POST /logout — putus sesi WA
 *   POST /send   — { number, message } kirim teks
 *
 * WHATSAPP_SERVER_SECRET: wajib jika NODE_ENV=production. Header: Authorization: Bearer <secret>
 * (Laravel & panel admin mem-proxy dengan token yang sama.)
 */
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const port = process.env.PORT || 3000;
const bind = process.env.WA_BIND || '127.0.0.1';
const apiSecret = (process.env.WHATSAPP_SERVER_SECRET || '').trim();
const isProd = process.env.NODE_ENV === 'production';

if (isProd && !apiSecret) {
    console.error('[wa-server] WHATSAPP_SERVER_SECRET wajib saat NODE_ENV=production.');
    process.exit(1);
}

/* Hanya dipanggil server-to-server dari Laravel — tanpa CORS terbuka ke sembarang origin */
app.use(cors({ origin: false }));
app.use(express.json({ limit: '1mb' }));

function requireSecret(req, res, next) {
    if (!apiSecret) {
        if (isProd) {
            return res.status(503).json({ error: 'Server misconfigured' });
        }
        return next();
    }
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    const a = Buffer.from(token, 'utf8');
    const b = Buffer.from(apiSecret, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return next();
}

app.use(requireSecret);

let currentQR = null;
let clientStatus = 'disconnected';

const chromePath = resolveChromeExecutable();

function beginInitialize() {
    clientStatus = 'starting';
    return client.initialize();
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        defaultViewport: null,
        ...(chromePath ? { executablePath: chromePath } : {}),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-zygote',
            '--disable-dev-shm-usage',
        ],
    },
});

client.on('qr', (qr) => {
    console.log('QR diterima — scan dari HP.');
    currentQR = qr;
    clientStatus = 'qr';
});

client.on('loading_screen', () => {
    if (!['qr', 'ready', 'authenticated'].includes(clientStatus)) {
        clientStatus = 'loading';
    }
});

client.on('ready', () => {
    console.log('WhatsApp siap mengirim pesan.');
    currentQR = null;
    clientStatus = 'ready';
});

client.on('authenticated', () => {
    console.log('Terautentikasi.');
    currentQR = null;
    clientStatus = 'authenticated';
});

client.on('auth_failure', (msg) => {
    console.error('Auth gagal', msg);
    currentQR = null;
    clientStatus = 'disconnected';
});

client.on('disconnected', (reason) => {
    console.log('Terputus:', reason);
    currentQR = null;
    clientStatus = 'disconnected';
    beginInitialize().catch((err) => {
        console.error('Gagal init ulang:', err);
        clientStatus = 'disconnected';
    });
});

beginInitialize().catch((err) => {
    console.error('Gagal init client:', err);
    clientStatus = 'disconnected';
});

app.get('/status', async (req, res) => {
    try {
        const response = {};

        // Selama ada string QR (event 'qr'), kirim gambar meskipun status sempat berganti
        // sebelum poll berikutnya — hindari QR "hilang" karena race authenticated vs poll.
        if (currentQR && clientStatus !== 'ready') {
            response.qrCode = await qrcode.toDataURL(currentQR);
            response.status = 'qr';
        } else {
            response.status = clientStatus;
        }

        if (clientStatus === 'ready' || clientStatus === 'authenticated') {
            try {
                response.info = client.info;
            } catch {
                response.info = null;
            }
        }

        return res.json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Gagal membaca status.' });
    }
});

app.post('/logout', async (req, res) => {
    try {
        if (['authenticated', 'ready'].includes(clientStatus)) {
            await client.logout();
            clientStatus = 'disconnected';
            return res.json({ success: true, message: 'Logout berhasil.' });
        }
        return res.json({ success: false, message: 'Client tidak terhubung.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Logout gagal.' });
    }
});

app.post('/send', async (req, res) => {
    try {
        if (clientStatus !== 'ready') {
            return res.status(400).json({ error: 'Client belum siap. Scan QR di panel admin.' });
        }

        const { number, message } = req.body || {};
        if (!number || !message) {
            return res.status(400).json({ error: 'number dan message wajib diisi.' });
        }

        let formatted = String(number).replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substring(1);
        }
        formatted += '@c.us';

        await client.sendMessage(formatted, String(message));
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: isProd ? 'Gagal mengirim pesan.' : (err.message || 'Gagal mengirim pesan.') });
    }
});

app.listen(port, bind, () => {
    console.log(
        `WA gateway http://${bind}:${port}${apiSecret ? ' (auth ON)' : ' (auth OFF — set WHATSAPP_SERVER_SECRET untuk production)'}`
    );
});
