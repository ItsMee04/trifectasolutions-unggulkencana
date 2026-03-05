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
        const responseData = error.response ? error.response.data : null;

        if (status === 401) {
            toast.warning("Sesi Anda telah berakhir. Silakan login kembali.");
            authStore.logout();
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        // 2. Tangani Error Validasi (422) secara dinamis
        else if (status === 422) {
            // Cek apakah ada pesan spesifik dari Laravel (errors.periode[0])
            // Jika tidak ada, gunakan message umum, jika tidak ada juga baru hardcoded string
            const validationErrors = responseData?.errors;
            let errorMessage = responseData?.message || "Data yang Anda masukkan tidak valid.";

            if (validationErrors) {
                // Mengambil pesan error pertama yang ditemukan dari objek errors
                const firstKey = Object.keys(validationErrors)[0];
                errorMessage = validationErrors[firstKey][0];
            }

            toast.error(errorMessage);
        }

        else if (status === 500) {
            // Menampilkan pesan error asli dari server jika ada (untuk memudahkan debugging)
            const msg = responseData?.message || "Terjadi kesalahan pada server.";
            toast.error(msg);
        }

        else if (!status) {
            toast.error("Koneksi gagal. Periksa jaringan Anda.");
        }

        return Promise.reject(error);
    }
);

export default apiClient;
