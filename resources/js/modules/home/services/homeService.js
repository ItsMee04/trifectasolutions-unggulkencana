import apiClient from '../../../helper/apiClient'

export const homeService = {
    async getTotalSaldoMasuk() {
        const response = await apiClient.get('/dashboard/getTotalSaldoMasuk');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTotalSaldoKeluar() {
        const response = await apiClient.get('/dashboard/getTotalSaldoKeluar');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTotalPenjualanMasuk() {
        const response = await apiClient.get('/dashboard/getTotalPenjualanMasuk');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTotalPenjualanKeluar() {
        const response = await apiClient.get('/dashboard/getTotalPenjualanKeluar');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async getTotalPelanggan() {
        const response = await apiClient.get('/dashboard/getTotalPelanggan');
        return response.data;
    },
    async getTotalSuplier() {
        const response = await apiClient.get('/dashboard/getTotalSuplier');
        return response.data;
    },
    async getTotalPenjualan() {
        const response = await apiClient.get('/dashboard/getTotalPenjualan');
        return response.data;
    },
    async getTotalPembelian() {
        const response = await apiClient.get('/dashboard/getTotalPembelian');
        return response.data;
    },
    async getSalesChart() {
        const response = await apiClient.get('/dashboard/getSalesChart');
        return response.data;
    },
    async getSalesChartPembelian() {
        const response = await apiClient.get('/dashboard/getSalesChartPembelian');
        return response.data;
    },
    async getHargaEmas() {
        const response = await apiClient.get('/dashboard/getHargaEmas');
        return response.data;
    },
    async getProdukPerbaikan() {
        const response = await apiClient.get('/dashboard/getProdukPerbaikan');
        return response.data;
    },
    async getTotalProduk() {
        const response = await apiClient.get('/dashboard/getProduk');
        return response.data;
    },
    async getTotalPenjualanHariIni() {
        const response = await apiClient.get('/dashboard/getTotalPenjualanHariIni');
        return response.data;
    },
    async getTotalPembelianHariIni() {
        const response = await apiClient.get('/dashboard/getTotalPembelianHariIni');
        return response.data;
    }
}
