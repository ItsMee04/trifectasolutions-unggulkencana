<template>
    <div class="sidebar" id="sidebar">
        <div class="sidebar-inner sidebar-scroll-area">
            <div id="sidebar-menu" class="sidebar-menu">
                <ul>
                    <template v-for="(group, groupKey) in menuGroups" :key="groupKey">
                        <li v-if="hasGroupAccess(group.menus)" class="submenu-open">
                            <h6 class="submenu-hdr">{{ group.header }}</h6>
                            <ul>
                                <template v-for="(menu, menuKey) in group.menus" :key="menuKey">

                                    <li v-if="!menu.submenus && hasAccess(menuKey, 'can_view')"
                                        :class="{ 'active': isRouteActive(menu.path) }">
                                        <router-link :to="menu.path">
                                            <i :data-feather="menu.icon"></i><span>{{ menu.label }}</span>
                                        </router-link>
                                    </li>

                                    <li v-else-if="menu.submenus && hasSubmenuAccess(menu.submenus, menuKey)"
                                        class="submenu">
                                        <a href="javascript:void(0);" @click.prevent="toggleSubmenu(menuKey)" :class="{
                                            'subdrop': openMenuId === menuKey,
                                            'active': isGroupActive(menu.submenus)
                                        }">
                                            <i :data-feather="menu.icon"></i>
                                            <span>{{ menu.label }}</span>
                                            <span class="menu-arrow"></span>
                                        </a>
                                        <ul :style="{ display: openMenuId === menuKey ? 'block' : 'none' }">
                                            <template v-for="sub in menu.submenus" :key="sub.path">
                                                <li
                                                    v-if="hasAccess(sub.permissionKey || sub.path.replace('/', ''), 'can_view')">
                                                    <router-link :to="sub.path"
                                                        :class="{ 'active': isRouteActive(sub.path) }">
                                                        {{ sub.name }}
                                                    </router-link>
                                                </li>
                                            </template>
                                        </ul>
                                    </li>

                                </template>
                            </ul>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useFeather } from '../../helper/feather';
import { useAuthStore } from '../../store/auth'; // Import store
// Import Composable Permission
import { usePermission } from '../../modules/role/composables/usePermission';

const route = useRoute();
const { initFeather } = useFeather();
const { hasAccess } = usePermission();
const authStore = useAuthStore(); // Import store

const openMenuId = ref(null);

const menuGroups = {
    main: {
        header: 'Main',
        menus: {
            dashboard: { label: 'Dashboard', icon: 'grid', path: '/dashboard' },
        }
    },
    master: {
        header: 'Master',
        menus: {
            usermanagement: {
                label: 'User Management',
                icon: 'users',
                submenus: [
                    { name: 'Jabatan', path: '/jabatan' },
                    { name: 'Pegawai', path: '/pegawai' },
                    { name: 'Role', path: '/role' },
                    { name: 'User', path: '/users' },
                ]
            },
            product: {
                label: 'Produk',
                icon: 'archive',
                submenus: [
                    { name: 'Kondisi', path: '/kondisi' },
                    { name: 'Karat', path: '/karat' },
                    { name: 'Jenis Karat', path: '/jeniskarat' },
                    { name: 'Harga', path: '/harga' },
                    { name: 'Diskon', path: '/diskon' },
                    { name: 'Jenis Produk', path: '/jenisproduk' },
                    { name: 'Produk', path: '/produk' },
                ]
            },
            nampan: {
                label: 'Nampan',
                icon: 'layers',
                submenus: [
                    { name: 'Nampan', path: '/nampan' },
                    { name: 'Nampan Produk', path: '/nampanproduk', permissionKey: 'nampanproduk' }
                ]
            },
            pelanggan: {
                label: 'Pelanggan',
                icon: 'users',
                submenus: [
                    { name: 'Pelanggan', path: '/pelanggan' },
                    { name: 'Suplier', path: '/suplier' },
                    { name: 'Pesan', path: '/pesan' },
                ]
            }
        }
    },
    keuangan: {
        header: 'Keuangan',
        menus: {
            saldo: { label: 'Saldo', icon: 'info', path: '/saldo' },
            mutasisaldo: { label: 'Mutasi Saldo', icon: 'info', path: '/mutasisaldo' },
        }
    },
    transaksi: {
        header: 'Transaksi',
        menus: {
            transaksi: { label: 'POS', icon: 'hard-drive', path: '/pos' },
            offtake: { label: 'Offtake', icon: 'pocket', path: '/offtake' },
            pembelian: {
                label: 'Pembelian',
                icon: 'shopping-bag',
                submenus: [
                    { name: 'Pembelian Dari Toko', path: '/pembeliandaritoko', permissionKey: 'pembelian' },
                    { name: 'Pembelian Dari Luar Toko', path: '/pembeliandariluartoko', permissionKey: 'pembeliandariluartoko' }
                ]
            },
            perbaikan: { label: 'Perbaikan', icon: 'repeat', path: '/perbaikan' },
        }
    },
    sales: {
        header: 'Sales',
        menus: {
            transaksipenjualan: { label: 'Transaksi Pejualan', icon: 'arrow-left-circle', path: '/transaksipenjualan' },
            transaksipembelian: { label: 'Transaksi Pembelian', icon: 'arrow-right-circle', path: '/transaksipembelian' },
            transaksiofftake: { label: 'Transaksi Offtake', icon: 'arrow-up-circle', path: '/transaksiofftake' },
        }
    },
    Laporan: {
        header: 'Laporan',
        menus: {
            iventory: { label: 'Inventori', icon: 'server', path: '/inventori' },
            laporantransaksi: { label: 'Laporan Transaksi', icon: 'book', path: '/laporan' },
        }
    },
};

// --- LOGIC FUNCTIONS ---

/**
 * Cek apakah sebuah group (Main, Master, dll) punya minimal 1 menu yang boleh tampil
 */
const hasGroupAccess = (menus) => {
    // BYPASS ADMIN: Jika user di store adalah Admin, munculkan semua group
    if (authStore.user?.role_id == 1 || authStore.user?.role === 'ADMIN') {
        return true;
    }

    return Object.entries(menus).some(([key, menu]) => {
        if (menu.submenus) {
            return hasSubmenuAccess(menu.submenus, key);
        }
        return hasAccess(key, 'can_view');
    });
};

/**
 * Cek akses untuk submenu.
 * Kita cek apakah ada salah satu anak yang boleh dilihat.
 */
const hasSubmenuAccess = (submenus, parentKey) => {
    // Jika ADMIN, tampilkan semua submenu
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'ADMIN') return true;

    return submenus.some(sub => {
        // Gunakan permissionKey jika ada, jika tidak gunakan path
        const key = sub.permissionKey || sub.path.replace('/', '');
        return hasAccess(key, 'can_view');
    });
};

const isRouteActive = (path) => route.path === path;

const isGroupActive = (submenus) => {
    return submenus.some(sub => route.path === sub.path);
};

const toggleSubmenu = (menuId) => {
    openMenuId.value = openMenuId.value === menuId ? null : menuId;
    nextTick(() => initFeather());
};

const autoOpenSubmenu = () => {
    for (const group of Object.values(menuGroups)) {
        for (const [menuKey, menu] of Object.entries(group.menus)) {
            if (menu.submenus && isGroupActive(menu.submenus)) {
                openMenuId.value = menuKey;
                return;
            }
        }
    }
};

onMounted(() => {
    autoOpenSubmenu();
    initFeather();
});

watch(() => route.path, () => {
    autoOpenSubmenu();
    nextTick(() => initFeather());
});
</script>

<style scoped>
/* Style tetap sama seperti milik Anda */
.sidebar-scroll-area {
    height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: hidden;
}

.sidebar-scroll-area::-webkit-scrollbar {
    width: 5px;
}

.sidebar-scroll-area::-webkit-scrollbar-thumb {
    background: #d5d5d5;
    border-radius: 10px;
}

.sidebar-inner {
    height: 100%;
    width: 100%;
}

.menu-arrow {
    transition: transform 0.3s ease;
}

.subdrop .menu-arrow {
    transform: rotate(90deg);
}
</style>
