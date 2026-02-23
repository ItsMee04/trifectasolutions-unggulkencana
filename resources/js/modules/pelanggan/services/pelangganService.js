import apiClient from '../../../helper/apiClient'

export const pelangganService = {
    async getPelanggan() {
        const response = await apiClient.get('/pelanggan/getPelanggan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storePelanggan(payload) {
        const response = await apiClient.post('/pelanggan/storePelanggan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePelanggan(payload) {
        const response = await apiClient.post('/pelanggan/updatePelanggan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deletePelanggan(payload) {
        const response = await apiClient.post('/pelanggan/deletePelanggan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
