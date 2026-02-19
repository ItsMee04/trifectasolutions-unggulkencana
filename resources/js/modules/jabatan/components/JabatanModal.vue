<template>
    <teleport to='body'>
        <div class="modal fade" id="jabatanModal" tabindex="-1" aria-labelledby="jabatanModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT JABATAN' : 'TAMBAH JABATAN' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="namaJabatan" class="form-label">Nama Jabatan</label>
                                        <input type="text" class="form-control" id="namaJabatan"
                                            v-model="formJabatan.jabatan" placeholder="Masukkan nama jabatan"
                                            :class="{ 'is-invalid': errors.jabatan }">
                                        <div class="invalid-feedback" v-if="errors.jabatan">{{ errors.jabatan }}</div>
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
import { useJabatan } from '../composables/useJabatan';

const { isLoading, formJabatan, errors, isEdit, submitJabatan } = useJabatan();

const handleSubmit = async () => {
    await submitJabatan();
};

</script>
