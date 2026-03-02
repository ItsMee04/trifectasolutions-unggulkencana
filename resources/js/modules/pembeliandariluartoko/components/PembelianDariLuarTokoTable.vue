<template>
    <div class="mb-3 mt-3">
        <div class="card-header d-flex align-items-center justify-content-between">
            <div class="card-title mb-0"><b>DAFTAR PRODUK</b></div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table text-nowrap table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">NO.</th>
                            <th scope="col">KODE PRODUK</th>
                            <th scope="col">NAMA</th>
                            <th scope="col">BERAT</th>
                            <th scope="col">HARGA</th>
                            <th scope="col">TOTAL</th>
                            <th scope="col" class="text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoadingPembelianDetail">
                            <td colspan="7" class="text-center">
                                <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                    aria-hidden="true"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="paginatedPembelianDetail.length === 0">
                            <td colspan="7" class="text-center">Tidak ada data.</td>
                        </tr>
                        <tr v-else v-for="(item, index) in paginatedPembelianDetail" :key="item.id">
                            <td scope="row">{{ (currentPagePembelianDetail - 1) * itemsPerPagePembelianDetail + index +
                                1 }}
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.produk?.kodeproduk }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
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
                                            <span>{{ item.berat }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ formatRupiah(item.hargabeli) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ formatRupiah(item.total) }}</span>
                                        </div>
                                    </div>
                                </div>
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

            <div v-if="filteredPembelianDetail.length > 0"
                class="d-flex justify-content-between align-items-center p-3">
                <div class="text-muted small">
                    Showing {{ (currentPagePembelianDetail - 1) * itemsPerPagePembelianDetail + 1 }} to
                    {{ Math.min(currentPagePembelianDetail * itemsPerPagePembelianDetail,
                        filteredPembelianDetail.length) }} of
                    {{ filteredPembelianDetail.length }} entries
                </div>

                <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPagePembelianDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPagePembelianDetail = 1">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPagePembelianDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPagePembelianDetail > 1 ? currentPagePembelianDetail-- : null">
                            Previous
                        </a>
                    </li>
                    <li v-for="page in displayedPagesPembelianDetail" :key="page" class="page-item"
                        :class="{ active: page === currentPagePembelianDetail }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPagePembelianDetail = page">{{
                            page }}</a>
                    </li>
                    <li class="page-item"
                        :class="{ disabled: currentPagePembelianDetail === totalPagesPembelianDetail }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPagePembelianDetail < totalPagesPembelianDetail && currentPagePembelianDetail++">
                            Next
                        </a>
                    </li>
                    <li class="page-item"
                        :class="{ disabled: currentPagePembelianDetail === totalPagesPembelianDetail }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPagePembelianDetail = totalPagesPembelianDetail">
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
import { formatRupiah } from '../../../helper/formatRupiah'
import { usePembelianDariLuarToko } from '../composables/usePembelianDariLuarToko';

const {
    filteredPembelianDetail,
    paginatedPembelianDetail,
    currentPagePembelianDetail,
    itemsPerPagePembelianDetail,
    isLoadingPembelianDetail,
    searchPembelianDetail,
    totalPagesPembelianDetail,
    displayedPagesPembelianDetail,
    fetchPembelianDetail,
    handleEdit,
    handleDelete,
} = usePembelianDariLuarToko();

const { initFeather } = useFeather();

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedPembelianDetail, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoadingPembelianDetail, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
    fetchPembelianDetail();
});
</script>
