import apiClient from '../../../helper/apiClient'

export const usersService = {
    async getUsers() {
        const response = await apiClient.get('/users/getUsers');
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
    async updateUsers(payload) {
        const response = await apiClient.post('/users/updateUsers', payload);
        return response.data; // Sesuaikan dengan struktur JSON Laravel Anda
    },
}
