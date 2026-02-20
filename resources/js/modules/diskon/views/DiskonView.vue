<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Diskon</h4>
                    <h6>Kelola Diskon Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Diskon
                </a>
            </div>
        </div>

        <div class="row">
            <DiskonTable />
        </div>
    </div>

    <DiskonModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useDiskon } from '../composables/useDiskon';
import DiskonTable from '../components/DiskonTable.vue';
import DiskonModal from '../components/DiskonModal.vue';

const { fetchDiskon, handleRefresh, handleCreate } = useDiskon();
onMounted(() => {
    fetchDiskon();
});
</script>
