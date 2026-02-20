import apiClient from '../../../helper/apiClient'

export const karatService = {
    async getKarat() {
        const response = await apiClient.get('/karat/getKarat');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeKarat(payload) {
        const response = await apiClient.post('/karat/storeKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateKarat(payload) {
        const response = await apiClient.post('/karat/updateKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteKarat(payload) {
        const response = await apiClient.post('/karat/deleteKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
