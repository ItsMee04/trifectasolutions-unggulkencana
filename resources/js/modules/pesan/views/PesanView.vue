<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Pesan</h4>
                    <h6>Kelola Pesan Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Pesan
                </a>
            </div>
        </div>

        <div class="row">
            <PesanTable />
        </div>
    </div>

    <PesanModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { usePesan } from '../composables/usePesan';
import PesanTable from '../components/PesanTable.vue';
import PesanModal from '../components/PesanModal.vue';

const { fetchPesan, handleRefresh, handleCreate } = usePesan();
onMounted(() => {
    fetchPesan();
});
</script>
