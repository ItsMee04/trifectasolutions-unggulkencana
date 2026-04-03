<template>
    <div class="main-wrapper">

        <Header />

        <Sidebar />

        <div class="page-wrapper cardhead">
            <RouterView />
        </div>

    </div>
</template>
<script setup>
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
import { onMounted } from 'vue';
import { usePermission } from '../modules/role/composables/usePermission';

import { useAuthStore } from '../store/auth';
const authStore = useAuthStore();
const { fetchPermissions } = usePermission();

onMounted(async () => {
    // Gunakan data dari store
    if (authStore.user && authStore.user.role_id) {
        // Jika Admin, sebenarnya tidak perlu fetch pun tidak apa-apa karena sudah di-bypass
        // Tapi tetap jalankan untuk jaga-jaga jika Admin ingin edit permission role lain
        await fetchPermissions(authStore.user.role_id);
    }
});
</script>
