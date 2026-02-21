<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Nampan</h4>
                    <h6>Kelola Nampan Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Nampan
                </a>
            </div>
        </div>

        <div class="row">
            <NampanTable />
        </div>
    </div>

    <NampanModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useNampan } from '../composables/useNampan';
import NampanTable from '../components/NampanTable.vue';
import NampanModal from '../components/NampanModal.vue';

const { fetchNampan, handleRefresh, handleCreate } = useNampan();
onMounted(() => {
    fetchNampan();
});
</script>
