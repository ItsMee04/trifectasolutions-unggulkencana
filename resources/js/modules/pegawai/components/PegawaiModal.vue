<template>
    <teleport to='body'>
        <div class="modal fade" id="pegawaiModal" tabindex="-1" aria-labelledby="pegawaiModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT PEGAWAI' : 'TAMBAH PEGAWAI' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="nipPegawai" class="form-label">NIP</label>
                                                <input type="text" class="form-control" id="nipPegawai"
                                                    v-model="formPegawai.nip" placeholder="Masukkan NIP"
                                                    :class="{ 'is-invalid': errors.nip }">
                                                <div class="invalid-feedback" v-if="errors.nip">{{ errors.nip }}</div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="namaPegawai" class="form-label">Nama</label>
                                                <input type="text" class="form-control" id="namaPegawai"
                                                    v-model="formPegawai.nama" placeholder="Masukkan nama"
                                                    :class="{ 'is-invalid': errors.nama }">
                                                <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="kontakPegawai" class="form-label">Kontak</label>
                                                <input type="text" class="form-control" id="kontakPegawai"
                                                    v-model="formPegawai.kontak" placeholder="Masukkan kontak"
                                                    :class="{ 'is-invalid': errors.kontak }">
                                                <div class="invalid-feedback" v-if="errors.kontak">{{ errors.kontak }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="jabatanPegawai" class="form-label">Jabatan</label>
                                                <Multiselect v-model="formPegawai.jabatan" :options="jabatanList"
                                                    :searchable="true" label="label" track-by="value"
                                                    placeholder="Pilih jabatan" id="jabatanPegawai" />
                                                <div class="invalid-feedback" v-if="errors.jabatan">{{ errors.jabatan }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label for="alamatPegawai" class="form-label">Alamat</label>
                                            <textarea v-model="formPegawai.alamat" placeholder="Masukan alamat"
                                                class="form-control" :class="{ 'is-invalid': errors.alamat }"
                                                id="namaPegawai" rows="4" cols="4" />
                                            <div class="invalid-feedback" v-if="errors.alamat">{{ errors.alamat }}</div>
                                        </div>
                                    </div>
                                    <div class="add-choosen">
                                        <div class="mb-3">
                                            <label for="imagePegawai" class="form-label">Image</label>
                                            <div class="image-upload">
                                                <input type="file" name="image" id="imagePegawai"
                                                    @change="handleFileChange" accept="image/*">
                                                <div class="image-uploads">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        class="plus-down-add me-0">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                        <polyline points="17 8 12 3 7 8"></polyline>
                                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                                    </svg>
                                                    <h4>UPLOAD IMAGE</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="phone-img mt-3"
                                            style="width: 150px; height: 150px; overflow: hidden; border-radius: 8px; border: 2px dashed #ccc; position: relative; background: #f9f9f9;">
                                            <img v-if="currentImagePreview" :src="currentImagePreview"
                                                alt="previewImage"
                                                style="width: 100%; height: 100%; display: block; object-fit: cover;">
                                            <div v-else
                                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; text-align: center; color: #888; font-size: 14px; padding: 10px;">
                                                <span class="text-center">Pratinjau Gambar</span>
                                            </div>
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
import { usePegawai } from '../composables/usePegawai';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

const {
    isEdit,
    isLoading,
    formPegawai,
    errors,
    jabatanList,
    currentImagePreview,
    resetForm,
    handleFileChange,
    fetchJabatan,
    submitPegawai
} = usePegawai();

const handleSubmit = async () => {
    await submitPegawai();
};

onMounted(() => {
    fetchJabatan();
    // Tambahan: Reset form saat modal ditutup lewat tombol 'X' atau klik luar
    const modalElement = document.getElementById('pegawaiModal');

    modalElement.addEventListener('hidden.bs.modal', () => {
        // 1. Reset data di Composable [cite: 2025-10-25]
        resetForm();

        // 2. Reset preview (Cukup ubah statenya, Vue akan hapus elemennya dari DOM)
        currentImagePreview.value = null;

        // 3. Reset input file (ini tetap harus manual DOM)
        const inputFile = document.getElementById('imagePegawai');
        if (inputFile) inputFile.value = '';
    });
});
</script>
