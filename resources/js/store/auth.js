import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { STORAGE_URL, BASE_DEFAULT_IMAGE_URL } from '../helper/base';

export const useAuthStore = defineStore('auth', () => {
    const authToken = ref(localStorage.getItem('auth_token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user_data')) || null);

    const isAuthenticated = computed(() => !!authToken.value);

    const profileImage = computed(() => {
        if (user.value?.image && user.value.image !== '' && user.value.image !== 'null') {
            const timestamp = new Date().getTime();

            return `${STORAGE_URL}/images/pegawai/${user.value.image}?t=${timestamp}`;
        }

        return BASE_DEFAULT_IMAGE_URL;
    });

    function updateUser(newUserData) {
        if (!user.value) return;

        user.value = { ...user.value, ...newUserData };

        localStorage.setItem('user_data', JSON.stringify(user.value));

        console.log("Store updated dengan data baru:", user.value);
    }

    function setSession(token, userData) {
        authToken.value = token;
        user.value = userData;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
    }

    function logout() {
        authToken.value = null;
        user.value = null;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    return {
        authToken,
        user,
        isAuthenticated,
        profileImage,
        updateUser,
        setSession,
        logout
    };
});
