import apiClient from '../../../helper/apiClient'

export const stockService = {
    async getPeriodeStok() {
        const response = await apiClient.get('/inventory/getPeriodeStok');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storePeriodeStok(payload) {
        const response = await apiClient.post('/inventory/storePeriodeStok', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getNampanProdukByPeriodeStok(payload) {
        const response = await apiClient.post('/inventory/getNampanProdukByPeriodeStok', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
