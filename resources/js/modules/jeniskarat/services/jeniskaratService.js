import apiClient from '../../../helper/apiClient'

export const jeniskaratService = {
    async getJenisKarat() {
        const response = await apiClient.get('/jeniskarat/getJenisKarat');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeJenisKarat(payload) {
        const response = await apiClient.post('/jeniskarat/storeJenisKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateJenisKarat(payload) {
        const response = await apiClient.post('/jeniskarat/updateJenisKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteJenisKarat(payload) {
        const response = await apiClient.post('/jeniskarat/deleteJenisKarat', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
