<template>
    <teleport to='body'>
        <div class="modal fade" id="pelangganModal" tabindex="-1" aria-labelledby="pelangganModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT PELANGGAN' : 'TAMBAH PELANGGAN' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="nama" class="form-label">Nama</label>
                                        <input type="text" class="form-control" id="nama"
                                            v-model="formPelanggan.nama" placeholder="Masukkan nama"
                                            :class="{ 'is-invalid': errors.nama }">
                                        <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="kontak" class="form-label">Kontak</label>
                                        <input type="text" class="form-control" id="kontak"
                                            v-model="formPelanggan.kontak" placeholder="Masukkan kontak"
                                            :class="{ 'is-invalid': errors.kontak }">
                                        <div class="invalid-feedback" v-if="errors.kontak">{{ errors.kontak }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="alamat" class="form-label">Alamat</label>
                                        <textarea class="form-control" v-model="formPelanggan.alamat" placeholder="Masukkan alamat"
                                            :class="{ 'is-invalid': errors.alamat }" id="alamat" cols="4" rows="4"></textarea>
                                        <div class="invalid-feedback" v-if="errors.alamat">{{ errors.alamat }}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="tanggal" class="form-label">Tanggal</label>
                                        <input type="date" class="form-control" id="tanggal"
                                            v-model="formPelanggan.tanggal" placeholder="Masukkan tanggal"
                                            :class="{ 'is-invalid': errors.tanggal }">
                                        <div class="invalid-feedback" v-if="errors.tanggal">{{ errors.tanggal }}</div>
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
import { usePelanggan } from '../composables/usePelanggan';

const { isLoading, formPelanggan, errors, isEdit, submitPelanggan } = usePelanggan();

const handleSubmit = async () => {
    await submitPelanggan();
};

</script>
