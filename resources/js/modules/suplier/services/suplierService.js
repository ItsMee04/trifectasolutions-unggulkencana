import apiClient from '../../../helper/apiClient'

export const suplierService = {
    async getSuplier() {
        const response = await apiClient.get('/suplier/getSuplier');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeSuplier(payload) {
        const response = await apiClient.post('/suplier/storeSuplier', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateSuplier(payload) {
        const response = await apiClient.post('/suplier/updateSuplier', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteSuplier(payload) {
        const response = await apiClient.post('/suplier/deleteSuplier', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
