<template>
    <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between">
            <div class="card-title mb-0"><b>DAFTAR PRODUK</b></div>

            <div class="d-flex align-items-center">
                <div class="input-group input-group-sm" style="width: 250px;">
                    <span class="input-group-text bg-transparent border-end-0">
                        <i data-feather="search" style="width: 14px; height: 14px;"></i>
                    </span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Produk..."
                        v-model="searchStokDetail" />
                </div>
            </div>
        </div>

        <div class="card-body">
            <div class="table-responsive">
                <table class="table text-nowrap table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">NO.</th>
                            <th scope="col">JENIS PRODUK</th>
                            <th scope="col">TOTAL POTONG</th>
                            <th scope="col">TOTAL BERAT</th>
                            <th scope="col">STATUS</th>
                            <th scope="col" class="text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoadingStokDetail">
                            <td colspan="6" class="text-center">
                                <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                    aria-hidden="true"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="paginatedStokDetail.length === 0">
                            <td colspan="6" class="text-center">Tidak ada data.</td>
                        </tr>
                        <tr v-else v-for="(item, index) in paginatedStokDetail" :key="item.id">
                            <td scope="row">{{ (currentPageStokDetail - 1) * itemPerPageStokDetail + index + 1 }}</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.jenisproduk?.jenis }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.potong }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.berat }}</span>
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
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="filteredStokDetail.length > 0" class="d-flex justify-content-between align-items-center p-3">
                <div class="text-muted small">
                    Showing {{ (currentPageStokDetail - 1) * itemPerPageStokDetail + 1 }} to
                    {{ Math.min(currentPageStokDetail * itemPerPageStokDetail, filteredStokDetail.length) }} of
                    {{ filteredStokDetail.length }} entries
                </div>

                <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPageStokDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageStokDetail = 1">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageStokDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageStokDetail > 1 ? currentPageStokDetail-- : null">
                            Previous
                        </a>
                    </li>
                    <li v-for="page in displayedStokDetail" :key="page" class="page-item"
                        :class="{ active: page === currentPageStokDetail }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageStokDetail = page">{{ page
                            }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageStokDetail === totalPagesStokDetail }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageStokDetail < totalPagesStokDetail && currentPageStokDetail++">
                            Next
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageStokDetail === totalPagesStokDetail }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageStokDetail = totalPagesStokDetail">
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
import { useStok } from '../composables/useStok';

const {
    isLoadingStokDetail,
    currentPageStokDetail,
    itemPerPageStokDetail,
    filteredStokDetail,
    paginatedStokDetail,
    displayedStokDetail,
    totalPagesStokDetail,
    selectedPeriodeOpnameData,
    searchStokDetail
} = useStok();

const { initFeather } = useFeather();

// 1. Gunakan getter function langsung ke variabelnya (tanpa .value di dalam arrow function)
watch(() => selectedPeriodeOpnameData, (newVal) => {
    if (newVal) initFeather();
}, { deep: true });

// 2. Jika Anda ingin memantau isLoadingStokDetail, pastikan variabelnya juga di-destructure
watch(() => isLoadingStokDetail?.value, (status) => {
    if (!status) initFeather();
});

watch(paginatedStokDetail, () => {
    initFeather();
}, { deep: true });

onMounted(() => {
    initFeather();
})
</script>
