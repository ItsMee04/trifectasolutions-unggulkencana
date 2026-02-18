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
            toast.warning("Email wajib diisi!");
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(form.value.email)) {
            errors.value.email = true; // Tandai merah jika format salah
            toast.warning("Format email tidak valid!");
            return false;
        }

        if (errors.value.password) {
            toast.warning("Password wajib diisi!");
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        // Jalankan validasi sebelum memproses login
        if (!validate()) return;

        isLoading.value = true;
        try {
            // Mengirim form.value langsung ke service
            const response = await AuthService.login(form.value);

            toast.success("Login berhasil!");

            authStore.setToken(response.token);
            authStore.setUser(response.user);

            router.push('/dashboard');
        } catch (error) {
            // Error 401/500 sudah ditangani di apiClient interceptor,
            // di sini kita menangani pesan spesifik jika ada.
            if (error.response?.status === 422) {
                toast.error("Email atau Password salah!");
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
