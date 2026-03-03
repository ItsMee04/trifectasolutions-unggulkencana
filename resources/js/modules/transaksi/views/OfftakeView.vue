<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Transaksi Offtake</h4>
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
            <OfftakeTable />
        </div>
    </div>

    <OfftakeViewModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useOfftake } from '../composable/useOfftake';
import OfftakeTable from '../components/OfftakeTable.vue';
import OfftakeViewModal from '../components/OfftakeViewModal.vue';

const { fetchOfftake, handleRefresh } = useOfftake();
onMounted(() => {
    fetchOfftake();
});
</script>
