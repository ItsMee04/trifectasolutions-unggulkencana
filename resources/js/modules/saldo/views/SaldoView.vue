<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Saldo</h4>
                    <h6>Kelola Saldo Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Saldo
                </a>
            </div>
        </div>

        <div class="row">
            <SaldoTable />
        </div>
    </div>

    <SaldoModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useSaldo } from '../composables/useSaldo';
import SaldoTable from '../components/SaldoTable.vue';
import SaldoModal from '../components/SaldoModal.vue';

const { fetchSaldo, handleRefresh, handleCreate } = useSaldo();
onMounted(() => {
    fetchSaldo();
});
</script>
