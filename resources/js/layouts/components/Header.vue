<template>
    <div class="header">
        <div class="header-left active">
            <a href="/" class="logo logo-normal">
                <img src="/public/assets/img/logo.png" alt="Logo" />
            </a>
            <a href="/" class="logo logo-white">
                <img src="/public/assets/img/logo-white.png" alt="Logo" />
            </a>
            <a href="/" class="logo-small">
                <img src="/public/assets/img/logo-small.png" alt="Logo" />
            </a>
            <a id="toggle_btn" href="javascript:void(0);" @click.prevent="toggleSidebar">
                <i data-feather="chevrons-left" class="feather-16"></i>
            </a>
        </div>
        <a id="mobile_btn" class="mobile_btn" @click.prevent="toggleMobileMenu">
            <span class="bar-icon">
                <span></span><span></span><span></span>
            </span>
        </a>

        <div class="sidebar-overlay" :class="{ opened: isMobileMenuOpen }" @click="closeMobileMenu"></div>

        <ul class="nav user-menu">
            <li class="nav-item nav-searchinputs">
                <div class="text-end me-3 d-none d-md-block">
                    <div class="fw-bold fs-6">{{ currentTime }}</div>

                    <div class="small text-muted d-flex align-items-center justify-content-end">
                        <span class="badge bg-primary-light text-primary me-2"
                            style="font-size: 10px; line-height: 1; padding: 3px 6px;">
                            {{ appVersion }}
                        </span>
                        <span>{{ currentDate }}</span>
                    </div>
                </div>
            </li>

            <li class="nav-item nav-item-box">
                <a href="javascript:void(0);" @click="toggleFullscreen">
                    <i data-feather="maximize"></i>
                </a>
            </li>

            <li class="nav-item dropdown nav-item-box">
                <a href="javascript:void(0);" class="dropdown-toggle nav-link" :class="{ 'show': isBellDropdownOpen }"
                    @click.prevent="toggleBellDropdown">
                    <i data-feather="bell"></i>
                    <span v-if="pelangganUltah.length > 0" class="badge rounded-pill bg-danger">
                        {{ pelangganUltah.length }}
                    </span>
                </a>
                <div class="dropdown-menu notifications" :class="{ 'show': isBellDropdownOpen }">
                    <div class="topnav-dropdown-header">
                        <span class="notification-title">Ulang Tahun Hari Ini</span>
                        <a href="javascript:void(0)" class="clear-noti" v-if="pelangganUltah.length > 0">
                            {{ currentDate }}
                        </a>
                    </div>
                    <div class="noti-content">
                        <ul class="notification-list">
                            <li v-for="p in pelangganUltah" :key="p.id" class="notification-message">
                                <a :href="`https://wa.me/${formatPhone(p.kontak)}?text=Halo+${p.nama},+Selamat+Ulang+Tahun!`"
                                    target="_blank" class="notification-link">
                                    <div class="d-flex align-items-center w-100">
                                        <div class="flex-shrink-0 me-3">
                                            <div class="bg-warning-light rounded-circle d-flex align-items-center justify-content-center"
                                                style="width: 38px; height: 38px;">
                                                <i class="fas fa-birthday-cake text-warning"
                                                    style="font-size: 14px;"></i>
                                            </div>
                                        </div>

                                        <div class="flex-grow-1 min-width-0">
                                            <p class="noti-details mb-0 text-truncate">
                                                <span class="noti-title fw-bold text-dark" style="font-size: 14px;">{{
                                                    p.nama }}</span>
                                            </p>
                                            <div class="line-height-xs">
                                                <small class="text-muted d-block" style="font-size: 11px;">Ulang tahun
                                                    hari ini</small>
                                                <span class="small text-primary fw-semibold">{{ p.kontak }}</span>
                                            </div>
                                        </div>

                                        <div class="flex-shrink-0">
                                            <i class="fab fa-whatsapp text-success"
                                                style="font-size: 18px; opacity: 0.6;"></i>
                                        </div>
                                    </div>
                                </a>
                            </li>

                            <li v-if="pelangganUltah.length === 0" class="p-3 text-center text-muted">
                                <small>Tidak ada pelanggan ulang tahun hari ini</small>
                            </li>
                        </ul>
                    </div>
                    <div class="topnav-dropdown-footer" v-if="pelangganUltah.length > 0">
                        <router-link :to="{ name: 'pelanggan' }">Lihat Semua Pelanggan</router-link>
                    </div>
                </div>
            </li>

            <li class="nav-item dropdown has-arrow main-drop">
                <a href="javascript:void(0);" class="dropdown-toggle nav-link userset"
                    @click.prevent="toggleUserDropdown">
                    <span class="user-info">
                        <span class="user-letter">
                            <img :src="authStore.profileImage" @error="(e) => e.target.src = BASE_DEFAULT_IMAGE_URL"
                                alt="User Image" />
                        </span>
                        <span class="user-detail">
                            <span class="user-name">{{ authStore.user?.nama || 'Guest' }}</span>
                            <span class="user-role">{{ authStore.user?.role || '-' }}</span>
                        </span>
                    </span>
                </a>

                <div class="dropdown-menu menu-drop-user" :class="{ 'show': isUserDropdownOpen }">
                    <div class="profilename">
                        <div class="profileset">
                            <span class="user-img">
                                <img :src="authStore.profileImage" @error="(e) => e.target.src = BASE_DEFAULT_IMAGE_URL"
                                    alt="User Image" />
                                <span class="status online"></span>
                            </span>
                            <div class="profilesets">
                                <h6>{{ authStore.user?.nama || 'Guest' }}</h6>
                                <h5>{{ authStore.user?.role || '-' }}</h5>
                            </div>
                        </div>
                        <hr class="m-0" />
                        <a class="dropdown-item logout pb-0" href="javascript:void(0);" @click.prevent="handleLogout">
                            <img :src="`${BASE_URL}/assets/img/icons/log-out.svg`" class="me-2" alt="img" />Logout
                        </a>
                    </div>
                </div>
            </li>
        </ul>

        <div class="dropdown mobile-user-menu">
            <a href="javascript:void(0);" class="nav-link dropdown-toggle" @click.prevent="toggleMobileUserMenu">
                <i class="fa fa-ellipsis-v"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-right" :class="{ 'show': isMobileUserMenuOpen }"
                style="right: 0; left: auto;">
                <a class="dropdown-item bg-secondary text-white rounded" href="javascript:void(0);"
                    @click.prevent="handleLogout">Logout</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { watch, onBeforeUnmount, onMounted, ref } from 'vue';
import { useFeather } from '../../helper/feather';
import { useAuthStore } from '../../store/auth';
import toast from '../../helper/toast';
import router from '../../router';
import { BASE_URL, BASE_DEFAULT_IMAGE_URL } from '../../helper/base';
import { pelangganService } from '../../modules/pelanggan/services/pelangganService';

const { initFeather } = useFeather();
const route = useRoute();

// State
const pelangganUltah = ref([]);
const currentTime = ref("");
const currentDate = ref("");
const isMobileMenuOpen = ref(false);
const isMobileUserMenuOpen = ref(false);
const isUserDropdownOpen = ref(false);
const isMiniSidebar = ref(false);
const isExpandMenu = ref(false);
const isBellDropdownOpen = ref(false);
const authStore = useAuthStore();
const appVersion = ref("v1.0.0"); // Default jika gagal fetch

// Timers
let clockTimer = null;
let dataPollingTimer = null;

const fetchVersion = () => {
    // Jika Anda menggunakan Inertia.js:
    // appVersion.value = usePage().props.appVersion;

    // Jika menggunakan API biasa, Anda bisa hardcode sementara
    // atau mengambil dari meta tag yang diletakkan di app.blade.php
    const versionTag = document.querySelector('meta[name="app-version"]');
    if (versionTag) {
        appVersion.value = versionTag.getAttribute('content');
    }
};

// Fungsi Fetch Data (Real-time compatible)
const fetchPelangganUltah = async () => {
    try {
        const res = await pelangganService.getPelangganUlangTahun();
        if (res && res.success) {
            // Data langsung diperbarui tanpa mengosongkan array (mencegah kedipan "No Data")
            pelangganUltah.value = res.data;
        }
    } catch (error) {
        console.error("Gagal sinkronisasi data ultah:", error);
    }
};

// Update Waktu
const updateTime = () => {
    const now = new Date();
    const optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDate.value = now.toLocaleDateString("id-ID", optionsDate);
    currentTime.value = now.toLocaleTimeString("id-ID", { hour12: false });
};

// Pantau rute: Jika user pindah halaman, pastikan data terbaru
watch(() => route.path, () => { fetchPelangganUltah(); });

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

const toggleBellDropdown = () => {
    isBellDropdownOpen.value = !isBellDropdownOpen.value;
    isUserDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
    if (!event.target.closest('.mobile-user-menu')) isMobileUserMenuOpen.value = false;
    if (!event.target.closest('.main-drop')) isUserDropdownOpen.value = false;
    if (!event.target.closest('.nav-item.dropdown.nav-item-box')) isBellDropdownOpen.value = false;
};

const formatPhone = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.substring(1);
    return cleaned;
};

const toggleSidebar = () => {
    isMiniSidebar.value = !isMiniSidebar.value;
    if (isMiniSidebar.value) {
        document.body.classList.add("mini-sidebar");
        document.body.classList.remove("expand-menu");
    } else {
        document.body.classList.remove("mini-sidebar");
    }
};

const handleMouseOver = (e) => {
    if (isMiniSidebar.value) {
        const target = e.target.closest(".sidebar, .header-left");
        if (target) {
            isExpandMenu.value = true;
            document.body.classList.add("expand-menu");
        } else {
            isExpandMenu.value = false;
            document.body.classList.remove("expand-menu");
        }
    }
};

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    const wrapper = document.querySelector('.main-wrapper') || document.body;
    wrapper.classList.toggle('slide-nav', isMobileMenuOpen.value);
    document.documentElement.classList.toggle('menu-opened', isMobileMenuOpen.value);
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
    isMobileUserMenuOpen.value = false;
    isUserDropdownOpen.value = false;
    const wrapper = document.querySelector('.main-wrapper') || document.body;
    wrapper.classList.remove('slide-nav');
    document.documentElement.classList.remove('menu-opened');
};

const toggleMobileUserMenu = () => {
    isMobileUserMenuOpen.value = !isMobileUserMenuOpen.value;
    isUserDropdownOpen.value = false;
};

const toggleUserDropdown = () => {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
    isMobileUserMenuOpen.value = false;
};

const handleLogout = async () => {
    try {
        authStore.logout();
        toast.success("Berhasil keluar.");
        await router.replace({ name: 'login' });
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

onMounted(() => {
    fetchPelangganUltah();
    initFeather();
    updateTime();
    fetchVersion(); // Panggil saat mount
    // Real-time Jam (setiap 1 detik)
    clockTimer = setInterval(updateTime, 1000);

    // Real-time Data (Polling setiap 5 menit agar tidak membebani server namun tetap update)
    dataPollingTimer = setInterval(fetchPelangganUltah, 300000);

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    clearInterval(clockTimer);
    clearInterval(dataPollingTimer);
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.notification-list {
    padding: 0 !important;
    margin: 0 !important;
    list-style: none !important;
}

.notification-message {
    border-bottom: 1px solid #f1f1f1;
}

.notification-message:last-child {
    border-bottom: none;
}

/* LINK AREA */
.notification-link {
    display: block;
    padding: 10px 14px;
    text-decoration: none;
    transition: background 0.2s ease;
}

.notification-link:hover {
    background-color: #f4fff7;
}

/* ICON ULTAH */
.bg-warning-light {
    background-color: #fff9e6;
}

/* CONTENT */
.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.line-height-xs {
    line-height: 1.2;
}

/* ICON WA */
.whatsapp-icon {
    font-size: 18px;
    color: #22c55e;
    opacity: 0.7;
    transition: all 0.2s ease;
}

.notification-link:hover .whatsapp-icon {
    opacity: 1;
    transform: scale(1.05);
}

/* DROPDOWN */
.main-drop .dropdown-menu.show,
.nav-item.dropdown .dropdown-menu.notifications.show {
    display: block !important;
    opacity: 1;
    visibility: visible;
    top: 50px !important;
    right: 0 !important;
    left: auto !important;
    margin: 0;
    transform: none;
    z-index: 1000;
}

.nav-item.dropdown .dropdown-menu.notifications.show {
    width: 320px !important;
}

/* CONTENT AREA */
.noti-content {
    max-height: 350px;
    overflow-y: auto !important;
}

/* HEADER */
.header-left.active {
    display: flex;
    align-items: center;
}

/* DROPDOWN */
.dropdown-menu.notifications {
    padding: 0 !important;
    overflow: hidden;
}
</style>
