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
    async cetakLaporanOfftake(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanofftake', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanPerbaikan(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanperbaikan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanStokBulanan(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanstokbulanan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanMutasiSaldo(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanmutasisaldo', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanNampan(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporannampan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async cetakLaporanProduk(payload) {
        const response = await apiClient.post('/laporan/getsignedurl-cetaklaporanproduk', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
