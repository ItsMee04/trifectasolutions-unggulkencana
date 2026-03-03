<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Perbaikan</h4>
                    <h6>Kelola Produk Anda</h6>
                </div>
            </div>
            <ul class="table-top-head">
                <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="Refresh" @click="handleRefresh">
                        <i data-feather="rotate-ccw" class="feather-rotate-ccw"></i>
                    </a>
                </li>
            </ul>
        </div>

        <div class="row">
            <PerbaikanTable />
        </div>
    </div>

    <!-- <HargaModal /> -->
</template>
<script setup>
import { onMounted } from 'vue';
import { usePerbaikan } from '../composables/usePerbaikan';
import PerbaikanTable from '../components/PerbaikanTable.vue';
// import HargaModal from '../components/HargaModal.vue';

const {
    fetchPerbaikan,
    handleRefresh,
    // handleCreate
} = usePerbaikan();
onMounted(() => {
    fetchPerbaikan();
});
</script>
