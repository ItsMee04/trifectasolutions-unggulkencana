import apiClient from '../../../helper/apiClient'

export const jenisprodukService = {
    async getJenisProduk() {
        const response = await apiClient.get('/jenisproduk/getJenisProduk');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeJenisProduk(payload) {
        const response = await apiClient.post('/jenisproduk/storeJenisProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateJenisProduk(payload) {
        const response = await apiClient.post('/jenisproduk/updateJenisProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteJenisProduk(payload) {
        const response = await apiClient.post('/jenisproduk/deleteJenisProduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
