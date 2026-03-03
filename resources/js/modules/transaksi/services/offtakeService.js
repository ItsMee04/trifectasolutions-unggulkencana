import apiClient from '../../../helper/apiClient'

export const offtakeService = {
    async getTransaksiOfftake() {
        const response = await apiClient.get(`/transaksiofftake/getTransaksiOfftake`);
        return response.data;
    },
    async batalTransaksi(payload) {
        const response = await apiClient.post('/transaksiofftake/batalTransaksi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
