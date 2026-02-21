import apiClient from '../../../helper/apiClient'

export const nampanService = {
    async getNampan() {
        const response = await apiClient.get('/nampan/getNampan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeNampan(payload) {
        const response = await apiClient.post('/nampan/storeNampan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateNampan(payload) {
        const response = await apiClient.post('/nampan/updateNampan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteNampan(payload) {
        const response = await apiClient.post('/nampan/deleteNampan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
