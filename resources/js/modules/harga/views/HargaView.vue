<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Harga</h4>
                    <h6>Kelola Harga Anda</h6>
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
                <a href="#" class="btn btn-added color" @click="handleCreate">
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Harga
                </a>
            </div>
        </div>

        <div class="row">
            <HargaTable />
        </div>
    </div>

    <HargaModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useHarga } from '../composables/useHarga';
import HargaTable from '../components/HargaTable.vue';
import HargaModal from '../components/HargaModal.vue';

const { fetchHarga, handleRefresh, handleCreate } = useHarga();
onMounted(() => {
    fetchHarga();
});
</script>
