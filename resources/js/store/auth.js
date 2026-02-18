import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { STORAGE_URL, BASE_DEFAULT_IMAGE_URL } from '../helper/base';

export const useAuthStore = defineStore('auth', () => {
    const authToken = ref(sessionStorage.getItem('auth_token') || null);
    const user = ref(JSON.parse(sessionStorage.getItem('user_data')) || null);

    // Getter modular untuk foto profil
    const profileImage = computed(() => {
        if (user.value?.image && user.value.image !== '' && user.value.image !== 'null') {
            return `${STORAGE_URL}/images/pegawai/${user.value.image}`;
        }
        return BASE_DEFAULT_IMAGE_URL;
    });

    // FUNGSI BARU: Untuk memperbarui data user secara reaktif
    function updateUser(newUserData) {
        user.value = { ...user.value, ...newUserData };
        sessionStorage.setItem('user_data', JSON.stringify(user.value));
    }

    function setSession(token, userData) {
        authToken.value = token;
        user.value = userData;
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_data', JSON.stringify(userData));
    }

    function logout() {
        authToken.value = null;
        user.value = null;
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user_data');
    }

    return { authToken, user, profileImage, updateUser, setSession, logout };
});
