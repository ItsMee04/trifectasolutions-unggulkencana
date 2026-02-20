<template>
    <teleport to='body'>
        <div class="modal fade" id="hargaModal" tabindex="-1" aria-labelledby="hargaModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT HARGA' : 'TAMBAH HARGA' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="karatList" class="form-label">Karat</label>
                                        <Multiselect v-model="formHarga.karat" :options="karatList" :searchable="true"
                                            label="label" track-by="value" placeholder="Pilih karat" id="karatList"
                                            @select="handleKaratChange" />
                                        <div class="invalid-feedback d-block" v-if="errors.karat">{{ errors.karat }}
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="jenisKaratList" class="form-label">Jenis Karat</label>
                                        <Multiselect v-model="formHarga.jenis" :options="jeniskaratList"
                                            :searchable="true" label="label" track-by="value"
                                            :placeholder="!formHarga.karat ? 'Pilih Karat terlebih dahulu' : 'Pilih jenis karat'"
                                            id="jenisKaratList" :disabled="!formHarga.karat" />
                                        <div class="invalid-feedback d-block" v-if="errors.jenis">{{ errors.jenis }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="harga" class="form-label">Harga</label>
                                        <input type="text" class="form-control" id="harga" v-model="formHarga.harga"
                                            placeholder="Masukkan harga" :class="{ 'is-invalid': errors.harga }">
                                        <div class="invalid-feedback" v-if="errors.harga">{{ errors.harga }}</div>
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

import { useHarga } from '../composables/useHarga';

const {
    isLoading,
    formHarga,
    karatList,
    jeniskaratList,
    fetchKarat,
    fetchJenisKarat,
    errors,
    isEdit,
    submitHarga,
    handleKaratChange,
} = useHarga();

const handleSubmit = async () => {
    await submitHarga();
};

onMounted(() => {
    fetchKarat();
    fetchJenisKarat();
});

</script>
