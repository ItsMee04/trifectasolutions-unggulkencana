<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Role</h4>
                    <h6>Kelola Role Anda</h6>
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
                    <i data-feather="plus-circle" class="me-2"></i>Tambah Role
                </a>
            </div>
        </div>

        <div class="row">
            <RoleTable />
        </div>
    </div>

    <RoleModal />
    <PermissionModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useRole } from '../composables/useRole';
import RoleTable from '../components/RoleTable.vue';
import RoleModal from '../components/RoleModal.vue';
import PermissionModal from '../components/PermissionModal.vue';

const { fetchRole, handleRefresh, handleCreate } = useRole();
onMounted(() => {
    fetchRole();
});
</script>
