<template>
    <teleport to='body'>
        <div class="modal fade" id="pesanModal" tabindex="-1" aria-labelledby="pesanModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT JUDUL' : 'TAMBAH JUDUL' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="judul" class="form-label">Judul</label>
                                        <input type="text" class="form-control" id="judul"
                                            v-model="formPesan.judul" placeholder="Masukkan judul"
                                            :class="{ 'is-invalid': errors.judul }">
                                        <div class="invalid-feedback" v-if="errors.judul">{{ errors.judul }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pesan" class="form-label">Pesan</label>
                                        <textarea class="form-control" v-model="formPesan.pesan" placeholder="Masukkan pesan"
                                            :class="{ 'is-invalid': errors.pesan }" id="pesan" cols="4" rows="4"></textarea>
                                        <div class="invalid-feedback" v-if="errors.pesan">{{ errors.pesan }}</div>
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
import { usePesan } from '../composables/usePesan';

const { isLoading, formPesan, errors, isEdit, submitPesan } = usePesan();

const handleSubmit = async () => {
    await submitPesan();
};

</script>
