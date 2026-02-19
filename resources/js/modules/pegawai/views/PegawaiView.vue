<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Pegawai</h4>
                    <h6>Kelola pegawai Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Pegawai
                </a>
            </div>
        </div>

        <div class="row">
            <PegawaiTable />
        </div>
    </div>

    <!-- <PegawaiModal /> -->
</template>

<script setup>
import { onMounted } from 'vue';
import { usePegawai } from '../composables/usePegawai';
import PegawaiTable from '../components/PegawaiTable.vue';
// import PegawaiModal from '../components/PegawaiModal.vue';

const { fetchPegawai, handleRefresh, handleCreate } = usePegawai();
onMounted(() => {
    fetchPegawai();
});
</script>
