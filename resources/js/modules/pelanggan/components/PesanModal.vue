<template>
    <teleport to='body'>
        <div class="modal fade" id="formKirimPesanModal" tabindex="-1" aria-labelledby="formKirimPesanModalLabel"
            aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>KIRIM PESAN</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleKirimPesanPelanggan">
                                    <div class="mb-3">
                                        <label for="nama" class="form-label">Nama</label>
                                        <input type="text" class="form-control" id="nama" v-model="formPelanggan.nama"
                                            placeholder="Masukkan nama" :class="{ 'is-invalid': errors.nama }">
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
                                        <label for="pesanList" class="form-label">Pesan</label>
                                        <Multiselect v-model="formPelanggan.judul" :options="pesanList"
                                            :searchable="true" label="label" track-by="value" placeholder="Pilih pesan"
                                            id="pesanList" />
                                        <div class="invalid-feedback" v-if="errors.judul">{{ errors.judul }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="isipesan" class="form-label">Isi Pesan</label>
                                        <textarea class="form-control" v-model="formPelanggan.pesan"
                                            :class="{ 'is-invalid': errors.pesan }" id="isipesan" cols="4"
                                            rows="4"></textarea>
                                        <div class="invalid-feedback" v-if="errors.pesan">{{ errors.pesan }}</div>
                                    </div>
                                    <div class="modal-footer-btn">
                                        <button type="button" class="btn btn-secondary me-2" @click="handleCancel">
                                            CANCEL
                                        </button>
                                        <button type="submit" class="btn btn-submit" :disabled="isLoading">
                                            {{ isLoading ? 'Loading...' : 'KIRIM WA' }}
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
import { usePelanggan } from '../composables/usePelanggan';
import { usePOS } from '../../pos/composables/usePOS';

const { isLoading, formPelanggan, errors, submitKirimPesan, pesanList, fetchPesan } = usePelanggan();
const { backToPaymentModal } = usePOS(); // Ambil fungsi backToPaymentModal

const handleKirimPesanPelanggan = async () => {
    const success = await submitKirimPesan();
    if (success) {
        backToPaymentModal(); // Kembali ke modal payment jika sukses
    }
};

const handleCancel = () => {
    backToPaymentModal(); // Kembali ke modal payment jika cancel/close
};

onMounted(() => {
    fetchPesan();
});

</script>
