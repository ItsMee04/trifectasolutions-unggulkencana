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
                    <div class="small text-muted">{{ currentDate }}</div>
                </div>
            </li>

            <li class="nav-item nav-item-box">
                <a href="javascript:void(0);" @click="toggleFullscreen">
                    <i data-feather="maximize"></i>
                </a>
            </li>

            <li class="nav-item dropdown nav-item-box">
                <a href="javascript:void(0);" class="dropdown-toggle nav-link" data-bs-toggle="dropdown">
                    <i data-feather="bell"></i><span class="badge rounded-pill">2</span>
                </a>
                <div class="dropdown-menu notifications">
                    <div class="topnav-dropdown-header">
                        <span class="notification-title">Notifications</span>
                        <a href="javascript:void(0)" class="clear-noti"> Clear All </a>
                    </div>
                    <div class="noti-content">
                        <ul class="notification-list">
                            <li class="notification-message">
                                <a href="#">
                                    <div class="media d-flex">
                                        <span class="avatar flex-shrink-0">
                                            <img alt="" src="/public/assets/img/profiles/avatar-02.jpg" />
                                        </span>
                                        <div class="media-body flex-grow-1">
                                            <p class="noti-details">
                                                <span class="noti-title">John Doe</span> added new task
                                                <span class="noti-title">Patient appointment booking</span>
                                            </p>
                                            <p class="noti-time"><span class="notification-time">4 mins ago</span></p>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
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
import { onBeforeUnmount, onMounted, ref, computed } from 'vue';
import { useFeather } from '../../helper/feather';
import { useAuthStore } from '../../store/auth';
import toast from '../../helper/toast';
import router from '../../router';
import { BASE_URL, STORAGE_URL, BASE_DEFAULT_IMAGE_URL } from '../../helper/base';
const { initFeather } = useFeather();

// State
const currentTime = ref("");
const currentDate = ref("");
const isMobileMenuOpen = ref(false);
const isMobileUserMenuOpen = ref(false);
const isUserDropdownOpen = ref(false); // State untuk dropdown profil desktop
const isMiniSidebar = ref(false);
const isExpandMenu = ref(false);
const authStore = useAuthStore();
let timer = null;

const updateTime = () => {
    const now = new Date();
    const optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    currentDate.value = now.toLocaleDateString("id-ID", optionsDate);
    currentTime.value = now.toLocaleTimeString("id-ID", { hour12: false });
};

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

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
    isUserDropdownOpen.value = false; // tutup desktop jika mobile dibuka
};

const toggleUserDropdown = () => {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
    isMobileUserMenuOpen.value = false; // tutup mobile jika desktop dibuka
};

const handleLogout = async () => {
    try {
        // 1. Hapus data di Pinia Store & SessionStorage
        authStore.logout();

        // 2. Tampilkan notifikasi
        toast.success("Berhasil keluar.");

        // 3. Redirect ke halaman login
        // Menggunakan replace agar user tidak bisa klik 'Back' kembali ke Dashboard
        await router.replace({ name: 'login' });
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

const handleClickOutside = (event) => {
    if (!event.target.closest('.mobile-user-menu')) {
        isMobileUserMenuOpen.value = false;
    }
    if (!event.target.closest('.main-drop')) {
        isUserDropdownOpen.value = false;
    }
};

onMounted(() => {
    initFeather();
    updateTime();
    timer = setInterval(updateTime, 1000);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    clearInterval(timer);
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* DROPDOWN MOBILE */
.mobile-user-menu .dropdown-menu.show {
    display: block !important;
    opacity: 1;
    visibility: visible;
    top: 70px !important;
    margin: 0;
    transform: none;
    margin-right: 15px;
}

/* DROPDOWN DESKTOP PROFILE */
.main-drop .dropdown-menu.show {
    display: block !important;
    opacity: 1;
    visibility: visible;
    top: 50px !important;
    /* Mengatur agar tidak terlalu ke bawah */
    right: 0;
    left: auto;
    margin: 0;
    transform: none;
}

.header-left.active {
    display: flex;
    align-items: center;
}

.nav-searchinputs {
    display: flex;
    align-items: center;
    padding: 0 15px;
}

.dropdown-menu {
    margin-top: 0;
}
</style>
