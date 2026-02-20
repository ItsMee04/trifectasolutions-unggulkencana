<template>
    <teleport to='body'>
        <div class="modal fade" id="usersModal" tabindex="-1" aria-labelledby="usersModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT USERS' : 'TAMBAH ROLE' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="namaUsers" class="form-label">Nama</label>
                                        <input type="text" class="form-control" id="namaUsers" v-model="formUsers.nama"
                                            readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="emailUsers" class="form-label">Email</label>
                                        <input type="text" class="form-control" id="emailUsers"
                                            v-model="formUsers.email" placeholder="Masukkan email"
                                            :class="{ 'is-invalid': errors.email }">
                                        <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="passwordUsers" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="passwordUsers"
                                            v-model="formUsers.password" placeholder="Masukkan password"
                                            :class="{ 'is-invalid': errors.password }">
                                        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="roleUsers" class="form-label">Role</label>
                                        <Multiselect v-model="formUsers.role" :options="roleList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih role" id="roleUsers" />
                                        <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}
                                        </div>
                                    </div>
                                    <div class="modal-footer-btn">
                                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                                            CANCEL
                                        </button>
                                        <button type="submit" class="btn btn-submit" :disabled="isLoading">
                                            {{ isLoading ? 'Loading...' : (isEdit ? 'UPDATE' : 'SIMPAN') }}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>
<script setup>
import { onMounted } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useUsers } from '../composables/useUsers';

const {
    isLoading,
    formUsers,
    errors,
    isEdit,
    roleList,
    fetchRole,
    submitUsers
} = useUsers();

const handleSubmit = async () => {
    await submitUsers();
};

onMounted(() => {
    fetchRole();
});

</script>
