import apiClient from '../../../helper/apiClient'

export const stokService = {
    async getPeriodeStok() {
        const response = await apiClient.get('/stokopname/getPeriodeStok');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storePeriodeStok(payload) {
        const response = await apiClient.post('/stokopname/storePeriodeStokOpname', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    // async getNampanProdukByPeriodeStok(payload) {
    //     const response = await apiClient.post('/inventory/getNampanProdukByPeriodeStok', payload);
    //     return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    // },
    // async getRekapStokByPeriode(payload) {
    //     const response = await apiClient.post('/inventory/getRekapStokByPeriode', payload);
    //     return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    // },
    // async finalPeriodeStok(payload) {
    //     const response = await apiClient.post('/inventory/finalPeriodeStok', payload);
    //     return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    // },
}
