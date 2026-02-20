/**
 * Helper untuk memformat angka ke Rupiah
 * Contoh: 10000 -> Rp 10.000
 */
export const formatRupiah = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};
