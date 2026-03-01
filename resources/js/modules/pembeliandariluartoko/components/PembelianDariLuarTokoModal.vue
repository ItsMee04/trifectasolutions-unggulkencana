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
                                <form @submit.prevent="handleSubmitProduk">
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
                                                <div class="invalid-feedback d-block" v-if="errors.jenisproduk">
                                                    {{ errors.jenisproduk }}
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
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="kondisi" class="form-label">Kondisi</label>
                                            <Multiselect v-model="formProduk.kondisi" :options="kondisiList"
                                                :searchable="true" label="label" track-by="value"
                                                placeholder="Pilih kondisi" id="kondisi" />
                                            <div class="invalid-feedback d-block" v-if="errors.kondisi">
                                                {{ errors.kondisi }}
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="hargaProduk" class="form-label">Harga Beli</label>
                                            <input type="text" class="form-control" id="lingkarProduk"
                                                v-model="formProduk.hargabeli" placeholder="Masukkan harga beli"
                                                :class="{ 'is-invalid': errors.hargabeli }">
                                            <div class="invalid-feedback" v-if="errors.hargabeli">{{ errors.hargabeli }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-6 col-12">
                                            <div class="mb-3">
                                                <label for="lingkarProduk" class="form-label">Lingkar</label>
                                                <input type="text" class="form-control" id="lingkarProduk"
                                                    v-model="formProduk.lingkar" placeholder="Masukkan lingkar"
                                                    :class="{ 'is-invalid': errors.lingkar }">
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
                                        <textarea v-model="formProduk.keteranganproduk" class="form-control" rows="4"
                                            cols="4" id="keterangan"></textarea>
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
import { usePembelianDariLuarToko } from '../composables/usePembelianDariLuarToko';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

const {
    isLoading,
    formProduk,
    errors,
    isEdit,
    jenisprodukList,
    karatList,
    jeniskaratList,
    kondisiList,
    fetchJenisKarat,
    fetchKarat,
    fetchJenisProduk,
    fetchKondisi,
    handleKaratChange,
    handleSubmitProduk,
} = usePembelianDariLuarToko();

onMounted(() => {
    fetchJenisProduk();
    fetchKarat();
    fetchJenisKarat();
    fetchKondisi();
})
</script>
