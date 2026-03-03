import apiClient from '../../../helper/apiClient'

export const perbaikanService = {
    async getPerbaikan() {
        const response = await apiClient.get('/perbaikan/getPerbaikan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async finalPerbaikan(payload) {
        const response = await apiClient.post('/perbaikan/finalPerbaikan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePerbaikan(payload) {
        const response = await apiClient.post('/perbaikan/updatePerbaikan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async batalPerbaikan(payload) {
        const response = await apiClient.post('/perbaikan/batalPerbaikan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
