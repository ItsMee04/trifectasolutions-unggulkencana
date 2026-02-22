<template>
    <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-0">
            <div class="p-3 border-bottom">
                <h6 class="fw-bold mb-3">Daftar Nampan</h6>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                        <i data-feather="search" style="width: 14px;"></i>
                    </span>
                    <input type="text" v-model="searchNampanQuery" class="form-control border-start-0"
                        placeholder="Cari nampan...">
                </div>
            </div>

            <div v-if="isLoading" class="p-5 text-center">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span>Memuat data...</span>
            </div>

            <div v-else-if="paginatedNampan.length === 0" class="p-5 text-center">
                <span class="text-muted">Tidak ada data nampan</span>
            </div>

            <div v-else class="list-group list-group-flush">
                <a v-for="item in paginatedNampan" :key="item.id" @click.prevent="handlePilihNampan(item)"
                    class="list-group-item list-group-item-action border-0 py-3"
                    :class="{ 'bg-light shadow-sm active-nampan': item.id === selectedNampanId }">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <div :class="item.total > 0 ? 'bg-soft-warning' : 'bg-soft-success'"
                                class="p-2 rounded me-3">
                                <i data-feather="box" :class="item.total > 0 ? 'text-warning' : 'text-success'"
                                    style="width: 18px;"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold text-dark">{{ item.nampan }}</span>
                                <small class="text-muted">Jenis: {{ item.jenisproduk?.jenis || '-' }}</small>
                            </div>
                        </div>
                        <i data-feather="chevron-right" class="text-warning" style="width: 16px;"></i>
                    </div>
                </a>
            </div>

            <div v-if="filteredNampan.length > 0" class="p-3 border-top">
                <div class="d-flex justify-content-center align-items-center mb-2">
                    <div class="text-muted small">
                        Showing {{ (currentPage - 1) * itemsPerPageNampan + 1 }} to
                        {{ Math.min(currentPage * itemsPerPageNampan, filteredNampan.length) }} of
                        {{ filteredNampan.length }}
                    </div>
                </div>

                <nav class="d-flex justify-content-center">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPage > 1 ? currentPage-- : null">Prev</a>
                        </li>

                        <li v-for="page in displayedPagesNampan" :key="page" class="page-item"
                            :class="{ active: page === currentPage }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = page"
                                :style="page === currentPage ? 'background-color: #ff9f43; border-color: #ff9f43;' : ''">
                                {{ page }}
                            </a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === totalPagesNampan }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPage < totalPagesNampan && currentPage++">Next</a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPage === totalPagesNampan }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = totalPagesNampan">
                                <i class="fas fa-angle-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useFeather } from '../../../helper/feather';
import { useNampanProduk } from '../composables/useNampanProduk';

const {
    nampan,
    selectedNampanId,
    searchNampanQuery,
    isLoading,
    currentPage,
    itemsPerPageNampan,
    totalPagesNampan,
    displayedPagesNampan,
    filteredNampan,
    paginatedNampan,
    handlePilihNampan,
    fetchNampan,
} = useNampanProduk();

const { initFeather } = useFeather();

// Inisialisasi ikon setiap kali data berubah atau loading selesai
watch([paginatedNampan, isLoading], () => {
    initFeather();
});

onMounted(() => {
    fetchNampan();
})
</script>
