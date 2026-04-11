/**
 * Shared utilities untuk halaman guest.
 * Import dari sini agar tidak ada duplikasi antar halaman.
 */

export const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);

/**
 * URL untuk atribut src gambar produk.
 * Backend mengirim `image_url` (path /storage/... atau URL absolut); fallback ke `image` mentah.
 */
export function productImageSrc(product) {
    if (!product) return null;
    const raw = product.image_url ?? product.image;
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    const u = String(raw).trim();
    if (/^https?:\/\//i.test(u) || u.startsWith('//') || u.startsWith('/storage/') || u.startsWith('data:')) {
        return u;
    }
    if (u.startsWith('/')) return u;
    return `/storage/${u.replace(/^\//, '')}`;
}

/**
 * Normalisasi nomor telepon Indonesia → link wa.me
 * Contoh: "08123456789" → "https://wa.me/628123456789"
 */
export function toWaLink(phone, message = '') {
    if (!phone) return null;
    const digits     = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
    const base       = `https://wa.me/${normalized}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Konfigurasi tampilan per-status order.
 */
/** Warna untuk tema guest terang (kartu putih / abu) */
export const orderStatusConfig = {
    unpaid: {
        color:  'text-amber-800',
        bg:     'bg-amber-50',
        border: 'border-amber-200',
        dot:    'bg-amber-500',
        pulse:  true,
        icon:   'clock',
        title:  'Menunggu Pembayaran',
        desc:   'Selesaikan pembayaran sebelum waktu habis. Pesanan akan otomatis diproses setelah pembayaran dikonfirmasi.',
    },
    paid: {
        color:  'text-blue-800',
        bg:     'bg-blue-50',
        border: 'border-blue-200',
        dot:    'bg-blue-500',
        pulse:  true,
        icon:   'refresh',
        title:  'Pembayaran Diterima',
        desc:   'Pembayaran telah dikonfirmasi. Key sedang diproses otomatis oleh sistem kami...',
    },
    success: {
        color:  'text-green-800',
        bg:     'bg-green-50',
        border: 'border-green-200',
        dot:    'bg-green-500',
        pulse:  false,
        icon:   'badge',
        title:  'Pesanan Selesai',
        desc:   'Key berhasil dikirim ke nomor WhatsApp Anda. Buka WhatsApp untuk melihat key lisensi.',
    },
    failed: {
        color:  'text-red-800',
        bg:     'bg-red-50',
        border: 'border-red-200',
        dot:    'bg-red-500',
        pulse:  false,
        icon:   'help',
        title:  'Pesanan Gagal',
        desc:   'Terjadi kendala dalam pemrosesan pesanan. Silakan hubungi CS kami dengan menyertakan nomor invoice.',
    },
    canceled: {
        color:  'text-red-800',
        bg:     'bg-red-50',
        border: 'border-red-200',
        dot:    'bg-red-500',
        pulse:  false,
        icon:   'help',
        title:  'Pesanan Dibatalkan',
        desc:   'Pesanan ini telah dibatalkan. Hubungi CS jika ini bukan kehendak Anda.',
    },
};
