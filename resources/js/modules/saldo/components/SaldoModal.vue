<template>
    <teleport to='body'>
        <div class="modal fade" id="saldoModal" tabindex="-1" aria-labelledby="saldoModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT SALDO' : 'TAMBAH SALDO' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="rekening" class="form-label">Rekening</label>
                                        <input type="text" class="form-control" id="rekening"
                                            v-model="formSaldo.rekening" placeholder="Masukkan rekening"
                                            :class="{ 'is-invalid': errors.rekening }">
                                        <div class="invalid-feedback" v-if="errors.rekening">{{ errors.rekening }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="statusList" class="form-label">Status</label>
                                        <Multiselect v-model="formSaldo.status" :options="statusList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih status" id="statusList" />
                                        <div class="invalid-feedback" v-if="errors.status">{{ errors.status }}
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
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useSaldo } from '../composables/useSaldo';

const { isLoading, statusList, formSaldo, errors, isEdit, submitSaldo } = useSaldo();

const handleSubmit = async () => {
    await submitSaldo();
};

</script>
