<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Pembelian Dari Toko</h4>
                    <h6>Kelola Pembelian Anda</h6>
                </div>
            </div>
            <ul class="table-top-head">
                <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" @click="handleRefresh">
                        <i data-feather="rotate-ccw" class="feather-rotate-ccw"></i>
                    </a>
                </li>
            </ul>
            <div class="page-btn import">
                <a href="#" class="btn btn-added color" @click="handleCariKodeTransaksi">
                    <i data-feather="search" class="me-2"></i>Cari Kode Transaksi
                </a>
            </div>
        </div>

        <div class="row">
            <PembelianDariTokoTableProduk />
            <PembelianDariTokoForm />
        </div>
    </div>

    <PembelianDariTokoModalCari />
</template>
<script setup>
import { usePembelianDariToko } from '../composables/usePembelianDariToko';
import PembelianDariTokoTableProduk from '../components/PembelianDariTokoTableProduk.vue';
import PembelianDariTokoForm from '../components/PembelianDariTokoForm.vue';
import PembelianDariTokoModalCari from '../components/PembelianDariTokoModalCari.vue';

const { handleCariKodeTransaksi } = usePembelianDariToko();
</script>
