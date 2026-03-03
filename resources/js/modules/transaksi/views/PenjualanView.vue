<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Transaksi Penjualan</h4>
                    <h6>Kelola Penjualan Anda</h6>
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
            <PenjualanTable />
        </div>
    </div>

    <PenjualanViewModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { usePenjualan } from '../composable/usePenjualan';
import PenjualanTable from '../components/PenjualanTable.vue';
import PenjualanViewModal from '../components/PenjualanViewModal.vue';

const { fetchPenjualan, handleRefresh } = usePenjualan();
onMounted(() => {
    fetchPenjualan();
});
</script>
