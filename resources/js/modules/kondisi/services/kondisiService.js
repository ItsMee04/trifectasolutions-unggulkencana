import apiClient from '../../../helper/apiClient'

export const kondisiService = {
    async getKondisi() {
        const response = await apiClient.get('/kondisi/getKondisi');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeKondisi(payload) {
        const response = await apiClient.post('/kondisi/storeKondisi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateKondisi(payload) {
        const response = await apiClient.post('/kondisi/updateKondisi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteKondisi(payload) {
        const response = await apiClient.post('/kondisi/deleteKondisi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
