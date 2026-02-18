<template>
    <div class="sidebar" id="sidebar">
        <div class="sidebar-inner sidebar-scroll-area">
            <div id="sidebar-menu" class="sidebar-menu">
                <ul>
                    <template v-for="(group, groupKey) in menuGroups" :key="groupKey">
                        <li class="submenu-open">
                            <h6 class="submenu-hdr">{{ group.header }}</h6>
                            <ul>
                                <template v-for="(menu, menuKey) in group.menus" :key="menuKey">

                                    <li v-if="!menu.submenus" :class="{ 'active': isRouteActive(menu.path) }">
                                        <router-link :to="menu.path">
                                            <i :data-feather="menu.icon"></i><span>{{ menu.label }}</span>
                                        </router-link>
                                    </li>

                                    <li v-else class="submenu">
                                        <a href="javascript:void(0);" @click.prevent="toggleSubmenu(menuKey)" :class="{
                                            'subdrop': openMenuId === menuKey,
                                            'active': isGroupActive(menu.submenus)
                                        }">
                                            <i :data-feather="menu.icon"></i>
                                            <span>{{ menu.label }}</span>
                                            <span class="menu-arrow"></span>
                                        </a>
                                        <ul :style="{ display: openMenuId === menuKey ? 'block' : 'none' }">
                                            <li v-for="sub in menu.submenus" :key="sub.path">
                                                <router-link :to="sub.path"
                                                    :class="{ 'active': isRouteActive(sub.path) }">
                                                    {{ sub.name }}
                                                </router-link>
                                            </li>
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

const route = useRoute();
const { initFeather } = useFeather();

// State logic
const openMenuId = ref(null); // Menu mana yang sedang terbuka (accordion)

// CONFIG MENU: Anda cukup edit di sini untuk menambah menu baru
// const menuGroups = {
//     main: {
//         header: 'Main',
//         menus: {
//             dashboard: {
//                 label: 'Dashboard',
//                 icon: 'grid',
//                 submenus: [
//                     { name: 'Admin Dashboard', path: '/dashboard' },
//                     { name: 'Sales Dashboard', path: '/sales-dashboard' },
//                 ]
//             },
//             application: {
//                 label: 'Application',
//                 icon: 'smartphone',
//                 submenus: [
//                     { name: 'Chat', path: '/chat' },
//                     { name: 'Calendar', path: '/calendar' },
//                     { name: 'Email', path: '/email' },
//                 ]
//             }
//         }
//     },
//     inventory: {
//         header: 'Inventory',
//         menus: {
//             products: { label: 'Products', icon: 'box', path: '/product-list' },
//             add_product: { label: 'Create Product', icon: 'plus-square', path: '/add-product' },
//             category: { label: 'Category', icon: 'codepen', path: '/category-list' },
//             brands: { label: 'Brands', icon: 'tag', path: '/brand-list' },
//         }
//     },
//     stock: {
//         header: 'Stock',
//         menus: {
//             manage_stock: { label: 'Manage Stock', icon: 'package', path: '/manage-stocks' },
//             adjustment: { label: 'Stock Adjustment', icon: 'clipboard', path: '/stock-adjustment' },
//         }
//     }
// };

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
                    { name: 'User', path: '/user' },
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
        }
    },
    keuangan: {
        header: 'Keuangan',
        menus: {
            dashboard: { label: 'Dashboard', icon: 'grid', path: '/dashboard' },
        }
    },
    transaksi: {
        header: 'Transaksi',
        menus: {
            usermanagement: {
                label: 'User Management',
                icon: 'users',
                submenus: [
                    { name: 'Jabatan', path: '/jabatan' },
                    { name: 'Pegawai', path: '/pegawai' },
                    { name: 'Role', path: '/role' },
                    { name: 'User', path: '/user' },
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
        }
    },
    sales: {
        header: 'Sales',
        menus: {
            dashboard: { label: 'Dashboard', icon: 'grid', path: '/dashboard' },
        }
    },
    Laporan: {
        header: 'Laporan',
        menus: {
            usermanagement: {
                label: 'User Management',
                icon: 'users',
                submenus: [
                    { name: 'Jabatan', path: '/jabatan' },
                    { name: 'Pegawai', path: '/pegawai' },
                    { name: 'Role', path: '/role' },
                    { name: 'User', path: '/user' },
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
        }
    },
};

// --- LOGIC FUNCTIONS ---

// Cek apakah route sedang aktif
const isRouteActive = (path) => route.path === path;

// Cek apakah salah satu anak submenu sedang aktif (agar induknya ikut berwarna biru)
const isGroupActive = (submenus) => {
    return submenus.some(sub => route.path === sub.path);
};

// Buka/Tutup Submenu
const toggleSubmenu = (menuId) => {
    openMenuId.value = openMenuId.value === menuId ? null : menuId;
    // Re-init feather jika ada perubahan DOM
    nextTick(() => initFeather());
};

// Otomatis buka folder submenu jika kita berada di halaman salah satu anaknya
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

// --- LIFECYCLE ---
onMounted(() => {
    autoOpenSubmenu();
    initFeather();
});

// Watch rute untuk update status aktif dan re-init feather icons
watch(() => route.path, () => {
    autoOpenSubmenu();
    nextTick(() => initFeather());
});
</script>

<style scoped>
/* Area Scroll */
.sidebar-scroll-area {
    height: calc(100vh - 60px);
    /* Kurangi tinggi header */
    overflow-y: auto;
    overflow-x: hidden;
}

/* Custom Scrollbar minimalis agar mirip simplebar */
.sidebar-scroll-area::-webkit-scrollbar {
    width: 5px;
}

.sidebar-scroll-area::-webkit-scrollbar-thumb {
    background: #d5d5d5;
    border-radius: 10px;
}

.sidebar-inner {
    height: 100%;
    max-height: 100%;
    width: 100%;
}

/* Perbaikan transisi arrow */
.menu-arrow {
    transition: transform 0.3s ease;
}

.subdrop .menu-arrow {
    transform: rotate(90deg);
}
</style>
