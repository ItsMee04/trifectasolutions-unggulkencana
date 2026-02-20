<template>
    <teleport to='body'>
        <div class="modal fade" id="diskonModal" tabindex="-1" aria-labelledby="diskonModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT DISKON' : 'TAMBAH DISKON' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="diskon" class="form-label">Diskon</label>
                                        <input type="text" class="form-control" id="diskon"
                                            v-model="formDiskon.diskon" placeholder="Masukkan diskon"
                                            :class="{ 'is-invalid': errors.diskon }">
                                        <div class="invalid-feedback" v-if="errors.diskon">{{ errors.diskon }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="nilaiDiskon" class="form-label">Nilai</label>
                                        <input type="text" class="form-control" id="nilaiDiskon"
                                            v-model="formDiskon.nilai" placeholder="Masukkan nilai"
                                            :class="{ 'is-invalid': errors.nilai }">
                                        <div class="invalid-feedback" v-if="errors.nilai">{{ errors.nilai }}</div>
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
import { useDiskon } from '../composables/useDiskon';

const { isLoading, formDiskon, errors, isEdit, submitDiskon } = useDiskon();

const handleSubmit = async () => {
    await submitDiskon();
};

</script>
