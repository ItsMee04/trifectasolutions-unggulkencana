<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Transaksi Pembelian</h4>
                    <h6>Kelola Transaksi Anda</h6>
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
            <PembelianTable />
        </div>
    </div>

    <PembelianViewModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { usePembelian } from '../composable/usePembelian';
import PembelianTable from '../components/PembelianTable.vue';
import PembelianViewModal from '../components/PembelianViewModal.vue';

const { fetchPembelian, handleRefresh } = usePembelian();
onMounted(() => {
    fetchPembelian();
});
</script>
