import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { STORAGE_URL, BASE_DEFAULT_IMAGE_URL } from '../helper/base';

export const useAuthStore = defineStore('auth', () => {
    const authToken = ref(sessionStorage.getItem('auth_token') || null);
    const user = ref(JSON.parse(sessionStorage.getItem('user_data')) || null);

    // Getter diperbaiki dengan Cache Busting (Timestamp)
    const profileImage = computed(() => {
        if (user.value?.image && user.value.image !== '' && user.value.image !== 'null') {
            // Tambahkan timestamp agar Header mendeteksi perubahan URL
            const timestamp = new Date().getTime();
            return `${STORAGE_URL}/images/pegawai/${user.value.image}?t=${timestamp}`;
        }
        return BASE_DEFAULT_IMAGE_URL;
    });

    // Gunakan spread operator agar Vue mendeteksi perubahan objek secara mendalam
    function updateUser(newUserData) {
        if (!user.value) return;

        // Memperbarui state secara reaktif
        user.value = { ...user.value, ...newUserData };

        // Simpan ke storage agar saat refresh data tetap baru
        sessionStorage.setItem('user_data', JSON.stringify(user.value));

        console.log("Store updated dengan data baru:", user.value);
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
