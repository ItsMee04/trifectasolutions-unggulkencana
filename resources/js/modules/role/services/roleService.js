import apiClient from '../../../helper/apiClient'

export const roleService = {
    async getRole() {
        const response = await apiClient.get('/role/getRole');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async storeRole(payload) {
        const response = await apiClient.post('/role/storeRole', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateRole(payload) {
        const response = await apiClient.post('/role/updateRole', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async deleteRole(payload) {
        const response = await apiClient.post('/role/deleteRole', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    }
}
