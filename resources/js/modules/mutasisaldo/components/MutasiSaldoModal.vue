<template>
    <teleport to='body'>
        <div class="modal fade" id="mutasisaldoModal" tabindex="-1" aria-labelledby="mutasisaldoModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT MUTASI SALDO' : 'TAMBAH MUTASI SALDO' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="rekening" class="form-label">Rekening</label>
                                        <Multiselect v-model="formMutasiSaldo.rekening" :options="saldoList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih rekening" id="statusList" />
                                        <div class="invalid-feedback" v-if="errors.rekening">{{ errors.rekening }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="tanggal" class="form-label">Tanggal</label>
                                        <input type="date" class="form-control" id="tanggal"
                                            v-model="formMutasiSaldo.tanggal" placeholder="Masukkan tanggal"
                                            :class="{ 'is-invalid': errors.tanggal }">
                                        <div class="invalid-feedback" v-if="errors.tanggal">{{ errors.tanggal }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="keterangan" class="form-label">Keterangan</label>
                                        <input type="text" class="form-control" id="keterangan"
                                            v-model="formMutasiSaldo.keterangan" placeholder="Masukkan keterangan"
                                            :class="{ 'is-invalid': errors.keterangan }">
                                        <div class="invalid-feedback" v-if="errors.keterangan">{{ errors.keterangan }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jenisList" class="form-label">Jenis</label>
                                        <Multiselect v-model="formMutasiSaldo.jenis" :options="jenisList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih jenis" id="jenisList" />
                                        <div class="invalid-feedback" v-if="errors.jenis">{{ errors.jenis }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jumlah" class="form-label">Jumlah</label>
                                        <input type="text" class="form-control" id="jumlah"
                                            v-model="formMutasiSaldo.jumlah" placeholder="Masukkan jumlah"
                                            :class="{ 'is-invalid': errors.jumlah }">
                                        <div class="invalid-feedback" v-if="errors.jumlah">{{ errors.jumlah }}</div>
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
import { useMutasiSaldo } from '../composables/useMutasiSaldo';

const { isLoading, saldoList, jenisList, fetchSaldo, formMutasiSaldo, errors, isEdit, submitMutasiSaldo } = useMutasiSaldo();

const handleSubmit = async () => {
    await submitMutasiSaldo();
};

onMounted(() => {
    fetchSaldo();
});

</script>
