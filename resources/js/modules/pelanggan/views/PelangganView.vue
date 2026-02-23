<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Pelanggan</h4>
                    <h6>Kelola Pelanggan Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Pelanggan
                </a>
            </div>
        </div>

        <div class="row">
            <PelangganTable />
        </div>
    </div>

    <PelangganModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { usePelanggan } from '../composables/usePelanggan';
import PelangganTable from '../components/PelangganTable.vue';
import PelangganModal from '../components/PelangganModal.vue';

const { fetchPelanggan, handleRefresh, handleCreate } = usePelanggan();
onMounted(() => {
    fetchPelanggan();
});
</script>
