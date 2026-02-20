<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Jenis Karat</h4>
                    <h6>Kelola Jenis Karat Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Jenis Karat
                </a>
            </div>
        </div>

        <div class="row">
            <JenisKaratTable />
        </div>
    </div>

    <JenisKaratModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useJenisKarat } from '../composables/useJenisKarat';
import JenisKaratTable from '../components/JenisKaratTable.vue';
import JenisKaratModal from '../components/JenisKaratModal.vue';

const { fetchJenisKarat, handleRefresh, handleCreate } = useJenisKarat();
onMounted(() => {
    fetchJenisKarat();
});
</script>
