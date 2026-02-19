import apiClient from '../../../helper/apiClient'

export const pegawaiService = {
    async getPegawai() {
        const response = await apiClient.get('/pegawai/getPegawai');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storePegawai(payload) {
        const response = await apiClient.post('/pegawai/storePegawai', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updatePegawai(payload) {
        const response = await apiClient.post('/pegawai/updatePegawai', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deletePegawai(payload) {
        const response = await apiClient.post('/pegawai/deletePegawai', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
