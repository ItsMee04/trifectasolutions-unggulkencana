<template>
    <div class="col-md-12 col-lg-8">
        <div class="pos-categories tabs_wrapper">
            <h5>DAFTAR JENIS PRODUK</h5>
            <p>Pilih Jenis Produk Untuk Menampilkan Produk</p>

            <div v-if="isLoading" class="p-5 text-center">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <h6>Memuat data...</h6>
            </div>

            <div v-else class="pos-category-container">
                <swiper :slides-per-view="'auto'" :space-between="15" :free-mode="true" :modules="[FreeMode]" tag="ul"
                    class="tabs pos-category">
                    <swiper-slide v-for="cat in jenisprodukList" :key="cat.id" tag="li"
                        :class="{ 'active': selectedJenisProduk === cat.id }" @click="selectCategory(cat)">
                        <div class="category-box">
                            <div class="icon-wrapper">
                                <i :data-feather="cat.id === 'all' ? 'grid' : 'shopping-bag'"></i>
                            </div>
                            <h6>{{ cat.jenis }}</h6>
                        </div>
                    </swiper-slide>
                </swiper>
            </div>

            <div class="pos-products mt-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <h5 class="mb-0">DAFTAR PRODUK</h5>

                    <div class="input-group input-group-sm border rounded-2 bg-white" style="width: 250px;">
                        <span class="input-group-text bg-white border-0 pe-1 text-muted">
                            <i data-feather="search" style="width: 14px; height: 14px;"></i>
                        </span>
                        <input type="text" class="form-control border-0 ps-1" style="box-shadow: none;"
                            placeholder="Cari kode atau nama..." v-model="searchProdukQuery" />
                    </div>
                </div>

                <div class="tabs_container">
                    <div class="tab_content active">
                        <div class="row">
                            <div v-for="product in paginatedProduk" :key="product.kodeproduk"
                                class="col-sm-12 col-md-6 col-lg-3 col-xl-3 mb-3">
                                <div class="product-info default-cover card">
                                    <a href="javascript:void(0);" class="img-bg">
                                        <img :src="product.image ? `/storage/images/produk/${product.image}?t=${new Date().getTime()}` : BASE_DEFAULT_IMAGE_URL"
                                            :alt="product.nama"
                                            style="max-height: 100px; width: auto; display: block; margin: 0 auto;">
                                        <span><i data-feather="check" class="feather-16"></i></span>
                                    </a>

                                    <h6 class="cat-name">
                                        <a href="javascript:void(0);">{{ product.nampan }} | {{ product.kodeproduk
                                        }}</a>
                                    </h6>

                                    <h6 class="product-name">
                                        <a href="javascript:void(0);">{{ product.nama }} ({{ product.karat }} - {{
                                            product.jeniskarat }})</a>
                                    </h6>

                                    <div class="d-flex align-items-center justify-content-between price">
                                        <span>
                                            <strong>{{ product.berat }} gr</strong>
                                            <small v-if="product.lingkar"> | L:{{ product.lingkar }}</small>
                                        </span>
                                        <p>Rp {{ Number(product.harga).toLocaleString('id-ID') }}</p>
                                    </div>
                                </div>
                            </div>

                            <div v-if="paginatedProduk.length === 0" class="col-12 text-center p-5">
                                <p>Tidak ada produk untuk kategori ini.</p>
                            </div>
                        </div>
                        <div v-if="filteredProduk.length > 0"
                            class="d-flex justify-content-between align-items-center p-3">
                            <div class="text-muted small">
                                Showing {{ (currentPageProduk - 1) * itemsPerPageProduk + 1 }} to
                                {{ Math.min(currentPageProduk * itemsPerPageProduk, filteredProduk.length) }} of
                                {{ filteredProduk.length }} entries
                            </div>

                            <ul class="pagination mb-0">
                                <li class="page-item" :class="{ disabled: currentPageProduk === 1 }">
                                    <a class="page-link" href="javascript:void(0);" @click="currentPageProduk = 1">
                                        <i class="fas fa-angle-double-left"></i>
                                    </a>
                                </li>

                                <li class="page-item" :class="{ disabled: currentPageProduk === 1 }">
                                    <a class="page-link" href="javascript:void(0);"
                                        @click="currentPageProduk > 1 ? currentPageProduk-- : null">
                                        Previous
                                    </a>
                                </li>

                                <li v-for="page in displayedPagesProduk" :key="page" class="page-item"
                                    :class="{ active: page === currentPageProduk }">
                                    <a class="page-link" href="javascript:void(0);" @click="currentPageProduk = page">
                                        {{ page }}
                                    </a>
                                </li>

                                <li class="page-item" :class="{ disabled: currentPageProduk === totalPagesProduk }">
                                    <a class="page-link" href="javascript:void(0);"
                                        @click="currentPageProduk < totalPagesProduk ? currentPageProduk++ : null">
                                        Next
                                    </a>
                                </li>

                                <li class="page-item" :class="{ disabled: currentPageProduk === totalPagesProduk }">
                                    <a class="page-link" href="javascript:void(0);"
                                        @click="currentPageProduk = totalPagesProduk">
                                        <i class="fas fa-angle-double-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useFeather } from '../../../helper/feather';
import { FreeMode } from 'swiper/modules';
import { BASE_URL, STORAGE_URL, BASE_DEFAULT_IMAGE_URL } from '../../../helper/base';

import 'swiper/css';
import 'swiper/css/free-mode';

import { usePOS } from '../composables/usePOS';
const {
    isLoading,
    jenisprodukList,
    selectedJenisProduk,
    produk,
    filteredProduk,
    paginatedProduk,
    searchProdukQuery,
    currentPageProduk,
    itemsPerPageProduk,
    totalPagesProduk,
    displayedPagesProduk,
    fetchJenisProduk,
    fetchProduk

} = usePOS();

const { initFeather } = useFeather();

const selectCategory = async (cat) => {
    selectedJenisProduk.value = cat.id;
    currentPageProduk.value = 1; // Reset ke halaman 1 setiap ganti kategori
    await fetchProduk(cat.id);
    await nextTick();
    initFeather();
};

// Reset ke halaman 1 setiap kali user mengetik di kolom pencarian
watch(searchProdukQuery, () => {
    currentPageProduk.value = 1;
});

// Jalankan initFeather setiap kali halaman berubah agar icon chevron muncul
watch(currentPageProduk, async () => {
    await nextTick();
    initFeather();
});

onMounted(async () => {
    await fetchJenisProduk();
    await fetchProduk('all'); // Load semua produk pertama kali

    setTimeout(async () => {
        await nextTick();
        initFeather();
    }, 500);
});
</script>

<style scoped>
.pos-category-container {
    padding: 15px 5px;
}

.pos-category {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex !important;
}

/* Kotak Kategori */
:deep(.swiper-slide) {
    width: 120px !important;
    height: 120px !important;
    background: #ffffff;
    border: 1px solid #f3f6f9;
    /* Border default */
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* Wrapper Konten - Animasi Naik */
.category-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
}

/* --- EFEK HOVER DENGAN OUTLINE ORANGE PRESISI --- */
:deep(.swiper-slide:hover:not(.active)) {
    /* Gunakan inset shadow untuk mensimulasikan outline orange yang sempurna */
    box-shadow: inset 0 0 0 1.5px #ff9f43;
    border-color: transparent;
    /* Sembunyikan border asli agar tidak bertumpuk */
}

:deep(.swiper-slide:hover:not(.active)) .category-box {
    transform: translateY(-8px);
}

/* Icon Styling */
.icon-wrapper {
    margin-bottom: 8px;
    color: #5b6670;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    transition: transform 0.3s ease;
}

.icon-wrapper :deep(svg) {
    width: 28px;
    height: 28px;
    display: block;
}

:deep(.swiper-slide:hover:not(.active)) .icon-wrapper {
    transform: scale(1.1);
    color: #ff9f43;
    /* Icon ikut jadi orange saat hover */
}

h6 {
    font-size: 13px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
    color: #212529;
}

span {
    font-size: 11px;
    color: #777;
    margin-top: 4px;
}

/* --- ACTIVE STATE --- */
:deep(.swiper-slide.active) {
    background: #ff9f43 !important;
    border-color: #ff9f43 !important;
    box-shadow: 0 8px 20px rgba(255, 159, 67, 0.3);
}

:deep(.swiper-slide.active) .category-box {
    transform: none;
}

:deep(.swiper-slide.active) .icon-wrapper,
:deep(.swiper-slide.active) h6,
:deep(.swiper-slide.active) span {
    color: #ffffff !important;
}

:deep(.swiper-slide.active) .icon-wrapper :deep(svg) {
    stroke: #ffffff !important;
}
</style>
