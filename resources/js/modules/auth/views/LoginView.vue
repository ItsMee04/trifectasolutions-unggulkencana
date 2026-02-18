<template>
    <div class="account-page">
        <div class="main-wrapper">
            <div class="account-content">
                <div class="login-wrapper login-new">
                    <div class="container">
                        <div class="login-content user-login">
                            <div class="login-logo">
                                <img src="/public/assets/img/logo.png" alt="img" />
                            </div>

                            <form @submit.prevent="handleLogin">
                                <div class="login-userset">
                                    <div class="login-userheading">
                                        <h3>Sign In</h3>
                                        <h4>Access the Dreamspos panel using your email and passcode.</h4>
                                    </div>

                                    <div class="form-login">
                                        <label class="form-label">Email Address</label>
                                        <div class="form-addons">
                                            <input v-model="form.email" type="text"
                                                :class="['form-control', { 'is-invalid': errors.email }]" />
                                            <img src="/public/assets/img/icons/mail.svg" alt="img" />
                                        </div>
                                    </div>

                                    <div class="form-login">
                                        <label>Password</label>
                                        <div class="pass-group">
                                            <input :type="isPasswordVisible ? 'text' : 'password'"
                                                v-model="form.password"
                                                :class="['pass-input', { 'is-invalid': errors.password }]" />
                                            <span @click="togglePassword"
                                                :class="['fas', isPasswordVisible ? 'fa-eye' : 'fa-eye-slash', 'toggle-password']"
                                                style="cursor: pointer">
                                            </span>
                                        </div>
                                    </div>

                                    <div class="form-login authentication-check">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="custom-control custom-checkbox">
                                                    <label class="checkboxs ps-4 mb-0 pb-0 line-height-1">
                                                        <input type="checkbox" v-model="form.remember" />
                                                        <span class="checkmarks"></span>Remember me
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-6 text-end">
                                                <a class="forgot-link" href="#">Forgot Password?</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-login">
                                        <button class="btn btn-login" type="submit" :disabled="isLoading">
                                            <span v-if="isLoading">Memuat data...</span>
                                            <span v-else>Sign In</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div class="my-4 d-flex justify-content-center align-items-center copyright-text">
                            <p>Copyright &copy; 2023 DreamsPOS. All rights reserved</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';

const {
    form,
    errors,
    isLoading,
    isPasswordVisible,
    togglePassword,
    handleLogin,
} = useAuth();
</script>

<style scoped>
/* Pastikan border menjadi merah saat class is-invalid aktif */
.form-control.is-invalid,
.pass-input.is-invalid {
    border: 1px solid #ff0000 !important;
}

/* Opsional: beri sedikit efek shadow merah */
.is-invalid:focus {
    box-shadow: 0 0 0 0.2rem rgba(255, 0, 0, 0.25) !important;
}

/* Menghilangkan icon centang/seru bawaan Bootstrap */
.form-control.is-invalid,
.was-validated .form-control:invalid {
    background-image: none !important;
    padding-right: calc(1.5em + 0.75rem) !important; /* Kembalikan padding normal */
}

/* Jika template menggunakan class pass-input */
.pass-input.is-invalid {
    background-image: none !important;
}
</style>
