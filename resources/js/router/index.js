import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/modules/auth/views/LoginView.vue';
import MainLayout from '../layouts/MainLayout.vue';

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView,
        meta: { guestOnly: true } // Penanda bahwa halaman ini hanya untuk yang BELUM login
    },
    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true }, // Penanda bahwa folder children ini butuh login
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/modules/home/views/DashboardView.vue')
            },
            {
                path: 'jabatan',
                name: 'jabatan',
                component: () => import('@/modules/jabatan/views/JabatanView.vue')
            },
            {
                path: 'pegawai',
                name: 'pegawai',
                component: () => import('@/modules/pegawai/views/PegawaiView.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    // Ambil token langsung dari sessionStorage untuk validasi cepat
    const isAuthenticated = sessionStorage.getItem('auth_token');

    // 1. Jika pengguna sudah login dan mencoba akses halaman login
    if (to.meta.guestOnly && isAuthenticated) {
        next({ name: 'dashboard' });
    }
    // 2. Jika halaman membutuhkan login tapi pengguna belum login
    else if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    }
    // 3. Biarkan navigasi berlanjut
    else {
        next();
    }
});

export default router;
