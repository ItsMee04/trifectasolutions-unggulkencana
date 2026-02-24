<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Suplier</h4>
                    <h6>Kelola Suplier Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Suplier
                </a>
            </div>
        </div>

        <div class="row">
            <SuplierTable />
        </div>
    </div>

    <SuplierModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useSuplier } from '../composables/useSuplier';
import SuplierTable from '../components/SuplierTable.vue';
import SuplierModal from '../components/SuplierModal.vue';

const { fetchSuplier, handleRefresh, handleCreate } = useSuplier();
onMounted(() => {
    fetchSuplier();
});
</script>
