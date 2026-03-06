import apiClient from '../../../helper/apiClient'

export const pembeliandaritokoService = {
    async getKodeTransaksi() {
        const response = await apiClient.get('/pembelian/getKodeTransaksi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTransaksiByKode(payload) {
        const response = await apiClient.post('/pembelian/getTransaksiByKode', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProdukToPembelianDetail(payload) {
        const response = await apiClient.post('/pembelian/storeProdukToPembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelian() {
        const response = await apiClient.get('/pembelian/getOfftake');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelianDetail() {
        const response = await apiClient.get('/pembelian/getPembelianDetail');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePembelianDetail(payload) {
        const response = await apiClient.post('/pembelian/updatePembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalPembelianDetail(payload) {
        const response = await apiClient.post('/pembelian/batalPembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentPembelian(payload) {
        const response = await apiClient.post('/pembelian/paymentPembelian', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async CetakNotaPembelian(payload) {
        const response = await apiClient.post(`/pembelian/getSignedNotaPembelianUrl`, payload);
        return response.data;
    },
}
