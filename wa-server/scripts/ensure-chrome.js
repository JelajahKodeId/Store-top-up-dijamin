/**
 * npm postinstall: unduh Chrome resmi Puppeteer jika belum ada di cache.
 * Chromium dari apt sering tidak cocok dengan versi Puppeteer — bundelan lebih andal.
 */
const { execSync } = require('child_process');
const fs = require('fs');

if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    console.log('[wa-server] postinstall: PUPPETEER_EXECUTABLE_PATH diatur, lewati unduhan.');
    process.exit(0);
}

let bundledPath = null;
try {
    const puppeteer = require('puppeteer');
    if (typeof puppeteer.executablePath === 'function') {
        bundledPath = puppeteer.executablePath();
    }
} catch {
    /* belum terpasang */
}

if (bundledPath && fs.existsSync(bundledPath)) {
    console.log('[wa-server] postinstall: Chrome Puppeteer sudah ada.');
    process.exit(0);
}

try {
    console.log('[wa-server] postinstall: mengunduh Chrome untuk Puppeteer (±100–200 MB, tunggu beberapa menit)…');
    execSync('npx puppeteer browsers install chrome', {
        stdio: 'inherit',
        env: process.env,
        cwd: require('path').join(__dirname, '..'),
    });
    console.log('[wa-server] postinstall: selesai.');
} catch {
    console.warn('\n[wa-server] Unduh otomatis gagal. Jalankan manual:\n  cd wa-server && npm run setup\n');
}

process.exit(0);
