import apiClient from '../../../helper/apiClient'

export const jabatanService = {
    async getJabatan() {
        const response = await apiClient.get('/jabatan/getJabatan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeJabatan(payload) {
        const response = await apiClient.post('/jabatan/storeJabatan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateJabatan(payload) {
        const response = await apiClient.post('/jabatan/updateJabatan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteJabatan(payload) {
        const response = await apiClient.post('/jabatan/deleteJabatan', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
