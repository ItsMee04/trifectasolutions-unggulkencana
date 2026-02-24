import apiClient from '../../../helper/apiClient'

export const pesanService = {
    async getPesan() {
        const response = await apiClient.get('/pesan/getPesan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storePesan(payload) {
        const response = await apiClient.post('/pesan/storePesan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePesan(payload) {
        const response = await apiClient.post('/pesan/updatePesan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deletePesan(payload) {
        const response = await apiClient.post('/pesan/deletePesan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
