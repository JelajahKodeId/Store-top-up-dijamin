/** Label status pembayaran transaksi member (tampilan manusia). */
export function memberPaymentStatusLabel(status) {
    const map = {
        pending: 'Menunggu pembayaran',
        success: 'Berhasil',
        failed: 'Gagal',
        cancelled: 'Dibatalkan',
    };
    return map[status] || status;
}
