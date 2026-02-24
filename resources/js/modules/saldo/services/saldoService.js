import apiClient from '../../../helper/apiClient'

export const saldoService = {
    async getSaldo() {
        const response = await apiClient.get('/saldo/getSaldo');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeSaldo(payload) {
        const response = await apiClient.post('/saldo/storeSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateSaldo(payload) {
        const response = await apiClient.post('/saldo/updateSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteSaldo(payload) {
        const response = await apiClient.post('/saldo/deleteSaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
