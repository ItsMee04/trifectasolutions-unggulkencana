import axios from 'axios';
import { useAuthStore } from '../store/auth';
import toast from './toast'; // Impor helper toast yang baru dibuat

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        // 'Content-Type': 'application/json'
    }
});

/**
 * Interceptor Request
 */
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.authToken) {
            config.headers.Authorization = `Bearer ${authStore.authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor Response dengan integrasi Toast
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const authStore = useAuthStore();
        const status = error.response ? error.response.status : null;

        // 1. Tangani Token Kadaluarsa / Unauthorized
        if (status === 401) {
            toast.warning("Sesi Anda telah berakhir. Silakan login kembali.");
            authStore.logout();
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        // 2. Tangani Error Validasi (422) secara global (opsional)
        else if (status === 422) {
            toast.error("Data yang Anda masukkan tidak valid.");
        }

        // 3. Tangani Server Error (500)
        else if (status === 500) {
            toast.error("Terjadi kesalahan pada server. Coba lagi nanti.");
        }

        // 4. Tangani Network Error (Server mati/Internet mati)
        else if (!status) {
            toast.error("Koneksi gagal. Periksa jaringan Anda.");
        }

        return Promise.reject(error);
    }
);

export default apiClient;
