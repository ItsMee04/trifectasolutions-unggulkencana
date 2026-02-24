<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Mutasi Saldo</h4>
                    <h6>Kelola Mutasi Saldo Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Mutasi Saldo
                </a>
            </div>
        </div>

        <div class="row">
            <MutasiSaldoTable />
        </div>
    </div>

    <MutasiSaldoModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useMutasiSaldo } from '../composables/useMutasiSaldo';
import MutasiSaldoTable from '../components/MutasiSaldoTable.vue';
import MutasiSaldoModal from '../components/MutasiSaldoModal.vue';

const { fetchMutasiSaldo, handleRefresh, handleCreate } = useMutasiSaldo();
onMounted(() => {
    fetchMutasiSaldo();
});
</script>
