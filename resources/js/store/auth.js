import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Ambil data awal dari sessionStorage agar tidak hilang saat refresh
    const authToken = ref(sessionStorage.getItem('auth_token') || null);
    const user = ref(JSON.parse(sessionStorage.getItem('user_data')) || null);

    function setSession(token, userData) {
        authToken.value = token;
        user.value = userData;

        // Simpan ke sessionStorage (otomatis terhapus jika browser/tab ditutup)
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
    }

    function logout() {
        authToken.value = null;
        user.value = null;
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
    }

    return { authToken, user, setSession, logout };
});
