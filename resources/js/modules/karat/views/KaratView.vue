<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Karat</h4>
                    <h6>Kelola Karat Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Karat
                </a>
            </div>
        </div>

        <div class="row">
            <KaratTable />
        </div>
    </div>

    <KaratModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useKarat } from '../composables/useKarat';
import KaratTable from '../components/KaratTable.vue';
import KaratModal from '../components/KaratModal.vue';

const { fetchKarat, handleRefresh, handleCreate } = useKarat();
onMounted(() => {
    fetchKarat();
});
</script>
