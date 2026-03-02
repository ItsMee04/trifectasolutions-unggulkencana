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
        const response = await apiClient.post('/pembelianluar/storeProdukToPembelianDetailDariLuar', payload);
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
        const response = await apiClient.post('/pembelianluar/updatePembelianDetailDariLuar', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalPembelianDetail(payload) {
        const response = await apiClient.post('/pembelianluar/batalPembelianDetailDariLuar', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentPembelian(payload) {
        const response = await apiClient.post('/pembelianluar/paymentPembelianDariLuar', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getCetakNotaPembelian(kode) {
        const response = await apiClient.get(`/pembelianluar/${kode}/getsignedurlnota`);
        return response.data;
    }
}
