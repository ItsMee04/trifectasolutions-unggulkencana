<template>
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>TRANSAKSI DARI LUAR TOKO</b></div>
            </div>
            <div class="card-body">
                <form @submit.prevent="paymentPembelian">
                    <div class="mb-3">
                        <label for="kode" class="form-label">Kode Transaksi</label>
                        <input type="text" class="form-control" id="kode" v-model="formDariLuarToko.kode" readonly>
                    </div>

                    <PembelianDariLuarTokoTable />

                    <div class="mb-3">
                        <label class="form-label d-block">Pembelian Dari</label>
                        <div class="d-flex align-items-center gap-4">
                            <div class="form-check form-check-inline m-0">
                                <input class="form-check-input" type="radio" name="pembelian_dari" id="supplier"
                                    value="supplier" v-model="formDariLuarToko.sumber">
                                <label class="form-check-label" for="supplier">Supplier</label>
                            </div>
                            <div class="form-check form-check-inline m-0">
                                <input class="form-check-input" type="radio" name="pembelian_dari" id="pelanggan"
                                    value="pelanggan" v-model="formDariLuarToko.sumber">
                                <label class="form-check-label" for="pelanggan">Pelanggan</label>
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 add-product">
                        <div v-if="isFetchingList" class="text-muted small">
                            <i class="fas fa-spinner fa-spin me-1"></i> Memuat data...
                        </div>

                        <div v-else>
                            <div v-if="formDariLuarToko.sumber === 'supplier'">
                                <div class="add-newplus">
                                    <label class="form-label">Pilih Suplier</label>
                                    <a @click="handleCreateSuplier"><i data-feather="plus-circle"
                                            class="plus-down-add"></i><span class="text-secondary">Tambah
                                            Suplier</span></a>
                                </div>
                                <Multiselect v-model="formDariLuarToko.selectedId" :options="supplierOptions"
                                    :searchable="true" label="label" track-by="value" placeholder="Pilih suplier"
                                    id="suplier" />
                            </div>

                            <div v-if="formDariLuarToko.sumber === 'pelanggan'">
                                <div class="add-newplus">
                                    <label class="form-label">Pilih Pelanggan</label>
                                    <a @click="handleCreatePelanggan"><i data-feather="plus-circle"
                                            class="plus-down-add"></i><span class="text-secondary">Tambah
                                            Pelanggan</span></a>
                                </div>
                                <Multiselect v-model="formDariLuarToko.selectedId" :options="pelangganOptions"
                                    :searchable="true" label="label" track-by="value" placeholder="Pilih pelanggan"
                                    id="pelanggan" />
                            </div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="keterangan" class="form-label">Keterangan / Catatan</label>
                        <textarea v-model="formDariLuarToko.keterangan" placeholder="Masukkan keterangan tambahan"
                            class="form-control" :class="{ 'is-invalid': errors.keterangan }" id="keterangan"
                            rows="3" />
                        <div class="invalid-feedback" v-if="errors.keterangan">{{ errors.keterangan }}</div>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-primary" :disabled="isLoading">
                            <span v-if="isLoading">
                                <i class="fas fa-spinner fa-spin me-1"></i> Memuat data...
                            </span>
                            <span v-else>PAYMENT (PEMBAYARAN)</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <SuplierModal />
    <PelangganModal />
</template>

<script setup>
import { onMounted } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

import { usePembelianDariLuarToko } from '../composables/usePembelianDariLuarToko';
import PembelianDariLuarTokoTable from './PembelianDariLuarTokoTable.vue';
import SuplierModal from '../../suplier/components/SuplierModal.vue'
import PelangganModal from '../../pelanggan/components/PelangganModal.vue'

const {
    formDariLuarToko,
    isLoading,
    isFetchingList,
    supplierOptions,
    pelangganOptions,
    errors,
    paymentPembelian,
    fetchKodeTransaksi,
    handleCreatePelanggan,
    handleCreateSuplier,
    fetchOptions,
} = usePembelianDariLuarToko();

onMounted(async () => {
    // Jalankan secara paralel untuk efisiensi
    await Promise.all([
        fetchKodeTransaksi(),
        fetchOptions() // Sekarang otomatis memproses 'supplier' karena default state
    ]);
});
</script>
