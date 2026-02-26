<template>
    <div class="col-xl-4">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>PRODUK PELANGGAN</b></div>
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
                            <tr v-else-if="paginatedPembelianDariToko.length === 0">
                                <td colspan="7" class="text-center">Tidak ada data.</td>
                            </tr>
                            <tr v-else v-for="(item, index) in paginatedPembelianDariToko" :key="item.id">
                                <td scope="row">{{ (currentPagePembelianDariTokoProduk - 1) *
                                    itemsPerPagePembelianDariTokoProduk + index + 1 }}
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
                    </table>
                </div>

                <div v-if="filteredPembelianDariToko.length > 0"
                    class="d-flex justify-content-between align-items-center p-3">
                    <div class="text-muted small">
                        Showing {{ (currentPagePembelianDariTokoProduk - 1) * itemsPerPagePembelianDariTokoProduk + 1 }}
                        to
                        {{ Math.min(currentPagePembelianDariTokoProduk * itemsPerPagePembelianDariTokoProduk,
                            filteredPembelianDariToko.length) }} of
                        {{ filteredPembelianDariToko.length }} entries
                    </div>

                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: currentPagePembelianDariTokoProduk === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePembelianDariTokoProduk = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPagePembelianDariTokoProduk === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePembelianDariTokoProduk > 1 ? currentPagePembelianDariTokoProduk-- : null">
                                Previous
                            </a>
                        </li>
                        <li v-for="page in displayedPagesPembelianDariTokoProduk" :key="page" class="page-item"
                            :class="{ active: page === currentPagePembelianDariTokoProduk }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePembelianDariTokoProduk = page">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: c === totalPagesPembelianDariTokoProduk }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePembelianDariTokoProduk < totalPagesPembelianDariTokoProduk && currentPagePembelianDariTokoProduk++">
                                Next
                            </a>
                        </li>
                        <li class="page-item"
                            :class="{ disabled: currentPagePembelianDariTokoProduk === totalPagesPembelianDariTokoProduk }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePembelianDariTokoProduk = totalPagesPembelianDariTokoProduk">
                                <i class="fas fa-angle-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePembelianDariToko } from '../composables/usePembelianDariToko';
import PembelianDariTokoTable from './PembelianDariTokoTable.vue';

const {
    formDariToko,
    isLoading,
    errors,
} = usePembelianDariToko();

// onMounted(() => {
//     fetchSuplier();
//     fetchKodeTransaksi();
// });
</script>
