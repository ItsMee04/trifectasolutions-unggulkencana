<template>
    <teleport to='body'>
        <div class="modal fade" id="nampanModal" tabindex="-1" aria-labelledby="nampanModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT NAMPAN' : 'TAMBAH NAMPAN' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="nampan" class="form-label">Nampan</label>
                                        <input type="text" class="form-control" id="jnampaneniskarat"
                                            v-model="formNampan.nampan" placeholder="Masukkan nampan"
                                            :class="{ 'is-invalid': errors.nampan }">
                                        <div class="invalid-feedback" v-if="errors.nampan">{{ errors.nampan }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jenisprodukList" class="form-label">Jenis Produk</label>
                                        <Multiselect v-model="formNampan.jenisproduk" :options="jenisprodukList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih jenis produk" id="jenisprodukList" />
                                        <div class="invalid-feedback" v-if="errors.jenisproduk">{{ errors.jenisproduk }}
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

import { useNampan } from '../composables/useNampan';

const { isLoading, formNampan, jenisprodukList, fetchJenisProduk, errors, isEdit, submitNampan } = useNampan();

const handleSubmit = async () => {
    await submitNampan();
};

onMounted(() => {
    fetchJenisProduk();
});

</script>
