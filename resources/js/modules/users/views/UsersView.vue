<template>
    <div class="content container-fluid">
        <div class="page-header">
            <div class="add-item d-flex">
                <div class="page-title">
                    <h4>Halaman Users Account</h4>
                    <h6>Kelola Users Anda</h6>
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
            <UsersTable />
        </div>
    </div>

    <UsersModal />
</template>
<script setup>
import { onMounted } from 'vue';
import { useUsers } from '../composables/useUsers';
import UsersTable from '../components/UsersTable.vue';
import UsersModal from '../components/UsersModal.vue';

const { fetchUsers, handleRefresh } = useUsers();
onMounted(() => {
    fetchUsers();
});
</script>
