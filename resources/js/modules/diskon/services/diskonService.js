import apiClient from '../../../helper/apiClient'

export const diskonService = {
    async getDiskon() {
        const response = await apiClient.get('/diskon/getDiskon');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeDiskon(payload) {
        const response = await apiClient.post('/diskon/storeDiskon', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateDiskon(payload) {
        const response = await apiClient.post('/diskon/updateDiskon', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteDiskon(payload) {
        const response = await apiClient.post('/diskon/deleteDiskon', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
