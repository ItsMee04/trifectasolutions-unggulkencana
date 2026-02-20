import apiClient from '../../../helper/apiClient'

export const hargaService = {
    async getHarga() {
        const response = await apiClient.get('/harga/getHarga');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeHarga(payload) {
        const response = await apiClient.post('/harga/storeHarga', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateHarga(payload) {
        const response = await apiClient.post('/harga/updateHarga', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteHarga(payload) {
        const response = await apiClient.post('/harga/deleteHarga', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
