import apiClient from '../../../helper/apiClient'

export const mutasisaldoService = {
    async getMutasiSaldo() {
        const response = await apiClient.get('/mutasisaldo/getMutasiSaldo');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeMutasiSaldo(payload) {
        const response = await apiClient.post('/mutasisaldo/storeMutasiSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateMutasiSaldo(payload) {
        const response = await apiClient.post('/mutasisaldo/updateMutasiSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteMutasiSaldo(payload) {
        const response = await apiClient.post('/mutasisaldo/deleteMutasiSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
