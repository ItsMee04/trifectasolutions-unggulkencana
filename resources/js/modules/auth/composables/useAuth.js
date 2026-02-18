import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/AuthService';
import { useAuthStore } from '../../../store/auth';
import toast from '../../../helper/toast';

export function useAuth() {
    const router = useRouter();
    const isLoading = ref(false);
    const isPasswordVisible = ref(false);
    const authStore = useAuthStore();
    const errors = ref({
        email: false,
        password: false
    });

    const form = ref({
        email: '',
        password: '',
        remember: false
    });

    const togglePassword = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
    };

    /**
     * Fungsi Validasi Internal
     */
    const validate = () => {
        // Reset state error setiap kali tombol ditekan
        errors.value.email = !form.value.email;
        errors.value.password = !form.value.password;

        if (errors.value.email) {
            toast.error("Email wajib diisi!");
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(form.value.email)) {
            errors.value.email = true; // Tandai merah jika format salah
            toast.error("Format email tidak valid!");
            return false;
        }

        if (errors.value.password) {
            toast.error("Password wajib diisi!");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        isLoading.value = true;
        try {
            const response = await AuthService.login(form.value);

            // Perhatikan ini:
            // 1. Backend Anda mengirim 'access_token'
            // 2. Store Anda menggunakan fungsi 'setSession' (bukan setToken)
            if (response.access_token) {

                // Panggil fungsi yang ada di store Anda
                authStore.setSession(response.access_token, response.user);

                toast.success("Login berhasil!");

                // Navigasi otomatis ke dashboard
                await router.push('/dashboard');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Email atau Password salah!");
            } else if (error.response?.status === 403) {
                toast.error("Akun Anda belum aktif!");
            } else {
                toast.error("Gagal terhubung ke server");
            }
        } finally {
            isLoading.value = false;
        }
    };

    // Auto-clear error saat user mengetik (UX yang lebih baik)
    watch(() => form.value.email, (val) => { if (val) errors.value.email = false; });
    watch(() => form.value.password, (val) => { if (val) errors.value.password = false; });

    return {
        form,
        errors,
        isLoading,
        isPasswordVisible,
        togglePassword,
        handleLogin
    };
}
