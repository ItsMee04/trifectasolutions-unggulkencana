<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Produk</h4>
                    <h6>Kelola Produk Anda</h6>
                </div>
            </div>
            <ul class="table-top-head">
                <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" @click="handleRefresh"><i
                            data-feather="rotate-ccw" class="feather-rotate-ccw"></i></a>
                </li>
            </ul>
            <div class="page-btn import">
                <a href="#" class="btn btn-added color" @click="handleCreate">
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Produk
                </a>
            </div>
        </div>

        <div class="row">
            <ProdukTable />
        </div>
    </div>

    <ProdukModal />
</template>

<script setup>
import { onMounted } from 'vue';
import { useProduk } from '../composables/useProduk';
import ProdukTable from '../components/ProdukTable.vue';
import ProdukModal from '../components/ProdukModal.vue';

const { fetchProduk, handleRefresh, handleCreate } = useProduk();
onMounted(() => {
    fetchProduk();
});
</script>
