import apiClient from '../../../helper/apiClient'

export const laporanService = {
    async cetakLaporanPenjualan(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanpenjualan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanPembelian(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanpembelian', payload);
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
