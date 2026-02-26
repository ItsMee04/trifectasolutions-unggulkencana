import apiClient from '../../../helper/apiClient'

export const pembeliandaritokoService = {
    async getKodeTransaksi() {
        const response = await apiClient.get('/offtake/getKodeTransaksi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProdukToPembelianDetail(payload) {
        const response = await apiClient.post('/offtake/storeProdukToOfftakeDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelian() {
        const response = await apiClient.get('/offtake/getOfftake');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getPembelianDetail() {
        const response = await apiClient.get('/offtake/getOfftakeDetail');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalPembelianDetail(payload) {
        const response = await apiClient.post('/offtake/batalOfftakeDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentPembelian(payload) {
        const response = await apiClient.post('/offtake/paymentOfftake', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getCetakNotaPembelian(kode) {
        const response = await apiClient.get(`/offtake/${kode}/getsignedurlnota`);
        return response.data;
    }
}
