<template>
    <div class="col-xl-6">
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
                                <th scope="col" class="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="isLoadingTransaksiPelanggan">
                                <td colspan="6" class="text-center">
                                    <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                        aria-hidden="true"></span>
                                    Memuat data...
                                </td>
                            </tr>
                            <tr v-else-if="paginatedTransaksiPelanggan.length === 0">
                                <td colspan="6" class="text-center">Tidak ada data.</td>
                            </tr>
                            <tr v-else v-for="(item, index) in paginatedTransaksiPelanggan" :key="item.id">
                                <td scope="row">{{ (currentPageTransaksiPelanggan - 1) *
                                    itemsPerPageTransaksiPelanggan + index + 1 }}
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.transaksidetail?.produk?.kodeproduk }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.transaksidetail?.produk?.nama }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.transaksidetail?.berat }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ formatRupiah(item.transaksidetail?.hargajual) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="action-table-data justify-content-center">
                                    <div class="edit-delete-action">
                                        <a class="confirm-text p-2" @click.prevent="handlePilihTransaksiPelanggan(item)">
                                            <i data-feather="arrow-right" class="feather-trash-2"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredTransaksiPelanggan.length > 0"
                    class="d-flex justify-content-between align-items-center p-3">
                    <div class="text-muted small">
                        Showing {{ (currentPageTransaksiPelanggan - 1) * itemsPerPageTransaksiPelanggan + 1 }}
                        to
                        {{ Math.min(currentPageTransaksiPelanggan * itemsPerPageTransaksiPelanggan,
                            filteredTransaksiPelanggan.length) }} of
                        {{ filteredTransaksiPelanggan.length }} entries
                    </div>

                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: currentPageTransaksiPelanggan === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPageTransaksiPelanggan = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPageTransaksiPelanggan === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPageTransaksiPelanggan > 1 ? currentPageTransaksiPelanggan-- : null">
                                Previous
                            </a>
                        </li>
                        <li v-for="page in displayedPagesTransaksiPelanggan" :key="page" class="page-item"
                            :class="{ active: page === currentPageTransaksiPelanggan }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPageTransaksiPelanggan = page">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPageTransaksiPelanggan === totalPagesTransaksiPelanggan }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPageTransaksiPelanggan < totalPagesTransaksiPelanggan && currentPageTransaksiPelanggan++">
                                Next
                            </a>
                        </li>
                        <li class="page-item"
                            :class="{ disabled: currentPageTransaksiPelanggan === totalPagesTransaksiPelanggan }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPageTransaksiPelanggan = totalPagesTransaksiPelanggan">
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
import { watch } from 'vue';
import { usePembelianDariToko } from '../composables/usePembelianDariToko';
import { formatRupiah } from '../../../helper/formatRupiah'
import { useFeather } from '../../../helper/feather'

const {
    formDariToko,
    isLoadingTransaksiPelanggan,
    currentPageTransaksiPelanggan,
    itemsPerPageTransaksiPelanggan,
    filteredTransaksiPelanggan,
    paginatedTransaksiPelanggan,
    displayedPagesTransaksiPelanggan,
    totalPagesTransaksiPelanggan,
    handlePilihTransaksiPelanggan,
} = usePembelianDariToko();

const { initFeather } = useFeather();


// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedTransaksiPelanggan, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoadingTransaksiPelanggan, (status) => {
    if (!status) initFeather();
});
</script>
