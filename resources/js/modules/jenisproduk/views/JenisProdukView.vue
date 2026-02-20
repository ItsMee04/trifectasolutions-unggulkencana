<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Jenis Produk</h4>
                    <h6>Kelola Jenis Produk Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Jenis Produk
                </a>
            </div>
        </div>

        <div class="row">
            <JenisProdukTable />
        </div>
    </div>

    <JenisProdukModal />
</template>

<script setup>
import { onMounted } from 'vue';
import { useJenisProduk } from '../composables/useJenisProduk';
import JenisProdukTable from '../components/JenisProdukTable.vue';
import JenisProdukModal from '../components/JenisProdukModal.vue';

const { fetchJenisProduk, handleRefresh, handleCreate } = useJenisProduk();
onMounted(() => {
    fetchJenisProduk();
});
</script>
