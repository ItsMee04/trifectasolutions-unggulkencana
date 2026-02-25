<template>
    <div class="mb-3 mt-3">
        <div class="card-header d-flex align-items-center justify-content-between">
            <div class="card-title mb-0"><b>DAFTAR PRODUK</b></div>

            <div class="d-flex align-items-center">
                <div class="input-group input-group-sm" style="width: 250px;">
                    <span class="input-group-text bg-transparent border-end-0">
                        <i data-feather="search" style="width: 14px; height: 14px;"></i>
                    </span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Kode Produk / Nama..."
                        v-model="searchOfftakeDetailQuery" />
                </div>
            </div>
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
                        <tr v-if="isLoading">
                            <td colspan="7" class="text-center">
                                <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                    aria-hidden="true"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="paginatedOfftakeDetail.length === 0">
                            <td colspan="7" class="text-center">Tidak ada data.</td>
                        </tr>
                        <tr v-else v-for="(item, index) in paginatedOfftakeDetail" :key="item.id">
                            <td scope="row">{{ (currentPageOfftakeDetail - 1) * itemsPerPageOfftakeDetail + index + 1 }}</td>
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
                                            <span>{{ formatRupiah(item.hargajual) }}</span>
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
                                    <a class="confirm-text p-2" @click.prevent="handleDelete(item)">
                                        <i data-feather="trash-2" class="feather-trash-2"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot v-if="filteredOfftakeDetail.length > 0 && !isLoading">
                        <tr class="table-light fw-bold">
                            <td colspan="3" class="text-end">TOTAL KESELURUHAN</td>
                            <td>{{ totalBerat.toFixed(2) }} gr</td>
                            <td>{{ totalProduk }} Item</td>
                            <td>{{ formatRupiah(totalHargaSemua) }}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div v-if="filteredOfftakeDetail.length > 0" class="d-flex justify-content-between align-items-center p-3">
                <div class="text-muted small">
                    Showing {{ (currentPageOfftakeDetail - 1) * itemsPerPageOfftakeDetail + 1 }} to
                    {{ Math.min(currentPageOfftakeDetail * itemsPerPageOfftakeDetail, filteredOfftakeDetail.length) }} of
                    {{ filteredOfftakeDetail.length }} entries
                </div>

                <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPageOfftakeDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageOfftakeDetail = 1">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageOfftakeDetail === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageOfftakeDetail > 1 ? currentPageOfftakeDetail-- : null">
                            Previous
                        </a>
                    </li>
                    <li v-for="page in displayedPagesOfftakeDetail" :key="page" class="page-item"
                        :class="{ active: page === currentPageOfftakeDetail }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageOfftakeDetail = page">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageOfftakeDetail === totalPagesOfftakeDetail }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageOfftakeDetail < totalPagesOfftakeDetail && currentPageOfftakeDetail++">
                            Next
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageOfftakeDetail === totalPagesOfftakeDetail }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageOfftakeDetail = totalPagesOfftakeDetail">
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
import { useOfftake } from '../composables/useOfftake';

const {
    filteredOfftakeDetail,
    paginatedOfftakeDetail,
    currentPageOfftakeDetail,
    itemsPerPageOfftakeDetail,
    isLoading,
    searchOfftakeDetailQuery,
    totalPagesOfftakeDetail,
    displayedPagesOfftakeDetail,
    fetchOfftakeDetail,
    handleDelete,
    totalProduk,
    totalBerat,
    totalHargaSemua,
} = useOfftake();

const { initFeather } = useFeather();

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedOfftakeDetail, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoading, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
    fetchOfftakeDetail();
});
</script>
