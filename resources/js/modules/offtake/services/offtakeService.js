import apiClient from '../../../helper/apiClient'

export const offtakeService = {
    async getKodeTransaksi() {
        const response = await apiClient.get('/offtake/getKodeTransaksi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProdukToOfftakeDetail(payload) {
        const response = await apiClient.post('/offtake/storeProdukToOfftakeDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getOfftake() {
        const response = await apiClient.get('/offtake/getOfftake');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getOfftakeDetail() {
        const response = await apiClient.get('/offtake/getOfftakeDetail');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalOfftakeDetail(payload) {
        const response = await apiClient.post('/offtake/batalOfftakeDetail', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async paymentOfftake(payload) {
        const response = await apiClient.post('/offtake/paymentOfftake', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getCetakNotaOfftake(kode) {
        const response = await apiClient.get(`/offtake/${kode}/getsignedurlnota`);
        return response.data;
    }
}
