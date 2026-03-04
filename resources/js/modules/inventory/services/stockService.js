import apiClient from '../../../helper/apiClient'

export const stockService = {
    async getPeriodeStok() {
        const response = await apiClient.get('/stock/getPeriodeStok');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
