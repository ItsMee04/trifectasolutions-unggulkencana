import apiClient from "../../../helper/apiClient";

export const AuthService = {
    async login(credentials) {
        // Melakukan request login
        // baseURL '/api' sudah otomatis ditambahkan dari apiClient
        const response = await apiClient.post('/login', credentials);
        return response.data;
    }
};
