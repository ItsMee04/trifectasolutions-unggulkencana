<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Jabatan</h4>
                    <h6>Kelola jabatan Anda</h6>
                </div>
            </div>
            <ul class="table-top-head">
                <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" @click="handleRefresh"><i
                            data-feather="rotate-ccw" class="feather-rotate-ccw"></i></a>
                </li>
            </ul>
            <div class="page-btn import">
                <a href="#" class="btn btn-added color" @click="handleCreate"><i data-feather="plus-circle"
                        class="me-2"></i>Tambah
                    Jabatan</a>
            </div>
        </div>

        <div class="row">
            <JabatanTable />
        </div>
    </div>

    <JabatanModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useJabatan } from '../composables/useJabatan';
import JabatanTable from '../components/JabatanTable.vue';
import JabatanModal from '../components/JabatanModal.vue';

const { fetchJabatan, handleRefresh, handleCreate } = useJabatan();
onMounted(() => {
    fetchJabatan();
});
</script>
