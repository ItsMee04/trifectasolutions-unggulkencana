<template>
    <teleport to='body'>
        <div class="modal fade" id="produkModal" tabindex="-1" aria-labelledby="produkModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>{{ isEdit ? 'EDIT PRODUK' : 'TAMBAH PRODUK' }}</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="namaProduk" class="form-label">Nama</label>
                                        <input type="text" class="form-control" id="namaProduk"
                                            v-model="formProduk.nama" placeholder="Masukkan nama"
                                            :class="{ 'is-invalid': errors.nama }">
                                        <div class="invalid-feedback" v-if="errors.nama">{{ errors.nama }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="beratProduk" class="form-label">Berat</label>
                                                <input type="text" class="form-control" id="beratProduk"
                                                    v-model="formProduk.berat" placeholder="Masukkan berat"
                                                    :class="{ 'is-invalid': errors.berat }">
                                                <div class="invalid-feedback" v-if="errors.berat">{{ errors.berat }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="jenisProduk" class="form-label">Jenis Produk</label>
                                                <Multiselect v-model="formProduk.jenisproduk" :options="jenisprodukList"
                                                    :searchable="true" label="label" track-by="value"
                                                    placeholder="Pilih jenis produk" id="jenisProduk" />
                                                <div class="invalid-feedback" v-if="errors.jenisproduk">{{
                                                    errors.jenisproduk }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="karatList" class="form-label">Karat</label>
                                                <Multiselect v-model="formProduk.karat" :options="karatList"
                                                    :searchable="true" label="label" track-by="value"
                                                    placeholder="Pilih karat" id="karatList"
                                                    @select="handleKaratChange" />
                                                <div class="invalid-feedback d-block" v-if="errors.karat">
                                                    {{ errors.karat }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="jenisKaratList" class="form-label">Jenis Karat</label>
                                                <Multiselect v-model="formProduk.jeniskarat" :options="jeniskaratList"
                                                    :searchable="true" label="label" track-by="value"
                                                    :placeholder="!formProduk.karat ? 'Pilih Karat dahulu' : 'Pilih jenis karat'"
                                                    id="jenisKaratList" :disabled="!formProduk.karat" />
                                                <div class="invalid-feedback d-block" v-if="errors.jeniskarat">
                                                    {{ errors.jeniskarat }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="hargaProduk" class="form-label">Harga</label>
                                        <input type="text" class="form-control" id="hargaProduk"
                                            v-model="formProduk.harga_display" readonly>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="lingkarProduk" class="form-label">Lingkar</label>
                                                <input type="text" class="form-control" id="lingkarProduk"
                                                    v-model="formProduk.lingkar" placeholder="Masukkan lingkar"
                                                    :class="{ 'is-invalid': errors.berat }">
                                                <div class="invalid-feedback" v-if="errors.lingkar">{{ errors.lingkar }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="panjangProduk" class="form-label">Panjang</label>
                                                <input type="text" class="form-control" id="lingkarProduk"
                                                    v-model="formProduk.panjang" placeholder="Masukkan panjang"
                                                    :class="{ 'is-invalid': errors.panjang }">
                                                <div class="invalid-feedback" v-if="errors.panjang">{{ errors.panjang }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="keterangan" class="form-label">Keterangan</label>
                                        <textarea v-model="formProduk.keterangan" class="form-control" rows="4" cols="4" id="keterangan"></textarea>
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
import { useProduk } from '../composables/useProduk';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

const {
    isEdit,
    isLoading,
    formProduk,
    errors,
    jenisprodukList,
    karatList,
    jeniskaratList,
    currentImagePreview,
    resetForm,
    handleFileChange,
    handleKaratChange,
    fetchJenisProduk,
    fetchKarat,
    fetchJenisKarat,
    submitProduk
} = useProduk();

const handleSubmit = async () => {
    await submitProduk();
};

onMounted(() => {
    fetchJenisProduk();
    fetchKarat();
    fetchJenisKarat();
    // Tambahan: Reset form saat modal ditutup lewat tombol 'X' atau klik luar
    const modalElement = document.getElementById('produkModal');

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

<style scoped>
/* Menyamakan tampilan multiselect yang didisabled agar tidak terlihat 'mati' secara ekstrem */
:deep(.multiselect--disabled) {
    background: #fff !important;
    opacity: 0.6;
}

:deep(.multiselect--disabled .multiselect__select) {
    background: #fff !important;
}

:deep(.multiselect--disabled .multiselect__tags) {
    background: #fff !important;
    border-color: #dee2e6 !important;
}
</style>
