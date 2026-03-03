import apiClient from '../../../helper/apiClient'

export const pembelianService = {
    async getTransaksiPembelian() {
        const response = await apiClient.get(`/transaksipembelian/getTransaksiPembelian`);
        return response.data;
    },
    async batalTransaksi(payload) {
        const response = await apiClient.post('/transaksipembelian/batalTransaksi', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
