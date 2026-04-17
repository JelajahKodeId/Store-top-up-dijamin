/**
 * Format angka ke Rupiah (tanpa simbol terpisah, locale id-ID).
 */
export function formatRp(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}
