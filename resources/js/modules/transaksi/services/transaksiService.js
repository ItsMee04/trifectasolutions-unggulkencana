import apiClient from '../../../helper/apiClient'

export const transaksiService = {
    async getKodeTransaksi() {
        const response = await apiClient.get('/transaksi/getKodeTransaksi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProdukToTransaksiDetail(payload) {
        const response = await apiClient.post('/transaksi/storeProdukToTransaksiDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTransaksiDetail() {
        const response = await apiClient.get('/transaksi/getTransaksiDetail');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalTransaksiDetail(payload) {
        const response = await apiClient.post('/transaksi/batalTransaksiDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentTransaksi(payload) {
        const response = await apiClient.post('/transaksi/paymentTransaksi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getCetakNotaTransaksi(kode) {
        const response = await apiClient.get(`/transaksi/${kode}/getsignedurlnota`);
        return response.data;
    },
    async getTransaksiPenjualan() {
        const response = await apiClient.get(`/transaksipenjualan/getTransaksiPenjualan`);
        return response.data;
    },
    async batalTransaksi(payload) {
        const response = await apiClient.post('/transaksipenjualan/batalTransaksi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
