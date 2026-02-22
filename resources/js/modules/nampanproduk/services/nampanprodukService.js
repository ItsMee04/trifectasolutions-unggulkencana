import apiClient from '../../../helper/apiClient'

export const nampanprodukService = {
    async getNampanProduk() {
        const response = await apiClient.get('/nampanproduk/getNampanProduk');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getNampanProdukByNampan(payload) {
        const response = await apiClient.post('/nampanproduk/getNampanProdukByNampan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeNampanProduk(payload) {
        const response = await apiClient.post('/nampanproduk/storeNampanProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateNampanProduk(payload) {
        const response = await apiClient.post('/nampanproduk/updateNampanProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteNampanProduk(payload) {
        const response = await apiClient.post('/nampanproduk/deleteNampanProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
