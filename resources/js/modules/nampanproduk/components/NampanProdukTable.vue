<template>
    <div class="card mb-3 border-0 shadow-sm bg-soft-primary">
        <div class="card-body p-3">
            <div class="row align-items-center text-center text-md-start">
                <div class="col-md-4 mb-2 mb-md-0">
                    <div v-if="selectedNampanData">
                        <small class="text-muted d-block">Nampan</small>
                        <span class="fw-bold">
                            {{ selectedNampanData?.id ? selectedNampanData.nampan : '-' }}
                        </span>
                    </div>
                    <div v-else>
                        <span class="text-muted italic">Pilih nampan...</span>
                    </div>
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <small class="text-muted d-block">Total Produk</small>
                    <span class="fw-bold">3 Item</span>
                </div>
                <div class="col-md-4 text-md-end">
                    <small class="text-muted d-block">Status</small>
                    <template v-if="selectedNampanData && selectedNampanData.id">
                        <span :class="['badge', selectedNampanData.status == 1 ? 'bg-success' : 'bg-danger']">
                            {{ selectedNampanData.status == 1 ? 'AKTIF' : 'TIDAK AKTIF' }}
                        </span>
                    </template>

                    <span v-else class="fw-bold">-</span>
                </div>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between">
            <div class="card-title mb-0"><b>DAFTAR PRODUK</b></div>

            <div class="d-flex align-items-center">
                <div class="input-group input-group-sm" style="width: 250px;">
                    <span class="input-group-text bg-transparent border-end-0">
                        <i data-feather="search" style="width: 14px; height: 14px;"></i>
                    </span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Produk..."
                        v-model="searchNampanProdukQuery" />
                </div>
            </div>
        </div>

        <div class="card-body">
            <div class="table-responsive">
                <table class="table text-nowrap table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">NO.</th>
                            <th scope="col">PRODUK</th>
                            <th scope="col">JENIS</th>
                            <th scope="col">TANGGAL</th>
                            <th scope="col">STATUS</th>
                            <th scope="col" class="text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoadingNampanProduk">
                            <td colspan="6" class="text-center">
                                <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                    aria-hidden="true"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="paginatedNampanProduk.length === 0">
                            <td colspan="6" class="text-center">Tidak ada data.</td>
                        </tr>
                        <tr v-else v-for="(item, index) in paginatedNampanProduk" :key="item.id">
                            <td scope="row">{{ (currentPageNampanProduk - 1) * itemsPerPageNampanProduk + index + 1 }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.produk?.nama }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.jenis }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.tanggal }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span v-if="item.status == 1" class="badge bg-success">
                                    ACTIVE
                                </span>
                                <span v-else class="badge bg-danger">
                                    INACTIVE
                                </span>
                            </td>
                            <td class="action-table-data justify-content-center">
                                <div class="edit-delete-action">
                                    <a class="me-2 p-2" @click.prevent="handleEdit(item)">
                                        <i data-feather="edit" class="feather-edit"></i>
                                    </a>
                                    <a class="confirm-text p-2" @click.prevent="handleDelete(item)">
                                        <i data-feather="trash-2" class="feather-trash-2"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="filteredNampanProduk.length > 0" class="d-flex justify-content-between align-items-center p-3">
                <div class="text-muted small">
                    Showing {{ (currentPageNampanProduk - 1) * itemsPerPageNampanProduk + 1 }} to
                    {{ Math.min(currentPageNampanProduk * itemsPerPageNampanProduk, filteredNampanProduk.length) }} of
                    {{ filteredNampanProduk.length }} entries
                </div>

                <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk = 1">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk > 1 ? currentPageNampanProduk-- : null">
                            Previous
                        </a>
                    </li>
                    <li v-for="page in displayedPagesNampanProduk" :key="page" class="page-item"
                        :class="{ active: page === currentPageNampanProduk }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk = page">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === totalPagesNampanProduk }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageNampanProduk < totalPagesNampanProduk && currentPageNampanProduk++">
                            Next
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === totalPagesNampanProduk }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk = totalPagesNampanProduk">
                            <i class="fas fa-angle-double-right"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useFeather } from '../../../helper/feather';
import { useNampanProduk } from '../composables/useNampanProduk';

// Ambil state dari composable
const {
    isLoadingNampanProduk,
    currentPageNampanProduk,
    itemsPerPageNampanProduk,
    filteredNampanProduk,
    paginatedNampanProduk,
    displayedPagesNampanProduk,
    totalPagesNampanProduk,
    selectedNampanData,
    searchNampanProdukQuery
} = useNampanProduk();
const { initFeather } = useFeather();

// Pantau perubahan nampan yang dipilih untuk re-render icon feather
watch(() => selectedNampanData.value, () => {
    initFeather();
});

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedNampanProduk, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoadingNampanProduk, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
});
</script>
