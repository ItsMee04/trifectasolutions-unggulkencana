import apiClient from '../../../helper/apiClient'

export const jabatanService = {
    async getJabatan() {
        const response = await apiClient.get('/jabatan/getJabatan');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
