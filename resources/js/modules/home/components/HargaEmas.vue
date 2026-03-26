<template>
    <div class="row">
        <div class="col-xl-6 col-sm-3 col-12 d-flex">
            <div class="card flex-fill default-cover mb-4">
                <div class="card-header d-flex justify-content-between align-items-center bg-secondary">
                    <h4 class="card-title mb-0 ">Harga Emas Hari Ini </h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive dataview">
                        <table class="table dashboard-recent-products">
                            <thead>
                                <tr>
                                    <th>Karat</th>
                                    <th>Jenis</th>
                                    <th>Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="isLoading">
                                    <td colspan="3" class="text-center">
                                        <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                            aria-hidden="true"></span>
                                        Memuat data...
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in hargaEmas" :key="index" v-else>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ item.karat.karat }} K</span>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ item.jeniskarat.jenis }}</span>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ formatRupiah(item.harga) }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-6 col-sm-3 col-12 d-flex">
            <div class="card flex-fill default-cover mb-4">
                <div class="card-header d-flex justify-content-between align-items-center bg-secondary">
                    <h4 class="card-title mb-0 ">Produk Perbaikan </h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive dataview">
                        <table class="table dashboard-recent-products">
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Kondisi</th>
                                    <th>Tanggal Masuk</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="isLoading">
                                    <td colspan="4" class="text-center">
                                        <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                            aria-hidden="true"></span>
                                        Memuat data...
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in produkPerbaikan" :key="index" v-else>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ item.produk.nama }} K</span>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ item.kondisi.kondisi }}</span>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-uppercase">{{ item.tanggalmasuk }}</span>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-uppercase">PENCUCIAN</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHome } from '../composables/useDashboard'; // Sesuaikan nama fungsi
import { formatRupiah } from '../../../helper/formatRupiah'; // Sesuaikan path helper Anda

// Ambil state dan fungsi fetch
const {
    hargaEmas,
    produkPerbaikan,
    isLoading,
    fetchHargaEmas,
    fetchProdukPerbaikan,
} = useHome();

onMounted(() => {
    fetchHargaEmas();
    fetchProdukPerbaikan(); // Wajib dipanggil agar data diambil dari API
});
</script>
