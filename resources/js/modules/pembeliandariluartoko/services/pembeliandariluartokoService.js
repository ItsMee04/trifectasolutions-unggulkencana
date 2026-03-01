import apiClient from '../../../helper/apiClient'

export const pembeliandariluartokoService = {
    async getKodeTransaksi() {
        const response = await apiClient.get('/pembelian/getKodeTransaksi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTransaksiByKode(payload) {
        const response = await apiClient.post('/pembelianluar/getTransaksiByKode', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProdukToPembelianDetail(payload) {
        const response = await apiClient.post('/pembelianluar/storeProdukToPembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelian() {
        const response = await apiClient.get('/pembelianluar/getOfftake');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelianDetail() {
        const response = await apiClient.get('/pembelianluar/getPembelianDetailDariLuar');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePembelianDetail(payload) {
        const response = await apiClient.post('/pembelianluar/updatePembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalPembelianDetail(payload) {
        const response = await apiClient.post('/pembelianluar/batalPembelianDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentPembelian(payload) {
        const response = await apiClient.post('/pembelianluar/paymentPembelian', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getCetakNotaPembelian(kode) {
        const response = await apiClient.get(`/pembelianluar/${kode}/getsignedurlnota`);
        return response.data;
    }
}
