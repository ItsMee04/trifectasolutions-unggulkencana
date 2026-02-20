import apiClient from '../../../helper/apiClient'

export const produkService = {
    async getProduk() {
        const response = await apiClient.get('/produk/getProduk');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeProduk(payload) {
        const response = await apiClient.post('/produk/storeProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateProduk(payload) {
        const response = await apiClient.post('/produk/updateProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteProduk(payload) {
        const response = await apiClient.post('/produk/deleteProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
