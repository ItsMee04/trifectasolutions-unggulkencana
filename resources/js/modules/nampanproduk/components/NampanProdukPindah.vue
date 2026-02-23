<template>
    <teleport to='body'>
        <div class="modal fade" id="nampanprodukpindahModal" tabindex="-1"
            aria-labelledby="nampanprodukpindahModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>PINDAH PRODUK</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="produk" class="form-label">Produk</label>
                                        <input type="text" class="form-control" id="produk"
                                            v-model="formNampanProduk.produk" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jenisprodukList" class="form-label">Nampan Tujuan</label>
                                        <Multiselect v-model="formNampanProduk.nampantujuan_id"
                                            :options="availableNampanTujuan" :searchable="true" label="nampan"
                                            track-by="id" placeholder="Pilih nampan tujuan..." id="nampanTujuan" />

                                        <div class="text-danger small mt-1" v-if="availableNampanTujuan.length === 0">
                                            * Tidak ada nampan lain dengan jenis yang sama.
                                        </div>
                                    </div>
                                    <div class="modal-footer-btn">
                                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                                            CANCEL
                                        </button>
                                        <button type="submit" class="btn btn-submit" :disabled="isLoading">
                                            {{ isLoading ? 'Loading...' : ('PINDAH') }}
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

import { useNampanProduk } from '../composables/useNampanProduk';

const {
    isLoading,
    formNampanProduk,
    errors,
    isEdit,
    availableNampanTujuan,
    submitPindah
} = useNampanProduk();

const handleSubmit = async () => {
    await submitPindah();
};

// onMounted(() => {
//     fetchJenisProduk();
// });

</script>
