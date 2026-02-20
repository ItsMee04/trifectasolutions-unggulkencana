<template>
    <teleport to='body'>
        <div class="modal fade" id="jeniskaratModal" tabindex="-1" aria-labelledby="jeniskaratModalLabel"
            aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT JENIS KARAT' : 'TAMBAH JENIS KARAT' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="jenisKaratList" class="form-label">Karat</label>
                                        <Multiselect v-model="formJenisKarat.karat" :options="karatList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih karat" id="jenisKaratList" />
                                        <div class="invalid-feedback" v-if="errors.karat">{{ errors.karat }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jeniskarat" class="form-label">Jenis Karat</label>
                                        <input type="text" class="form-control" id="jeniskarat"
                                            v-model="formJenisKarat.jenis" placeholder="Masukkan jenis karat"
                                            :class="{ 'is-invalid': errors.jenis }">
                                        <div class="invalid-feedback" v-if="errors.jenis">{{ errors.jenis }}</div>
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

import { useJenisKarat } from '../composables/useJenisKarat';

const { isLoading, formJenisKarat, karatList, fetchKarat, errors, isEdit, submitJenisKarat } = useJenisKarat();

const handleSubmit = async () => {
    await submitJenisKarat();
};

onMounted(() => {
    fetchKarat();
});

</script>
