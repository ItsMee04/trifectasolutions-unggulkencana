<template>
    <div class="col-xl-8">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>TRANSAKSI DARI TOKO</b></div>
            </div>
            <div class="card-body">
                <form @submit.prevent="paymentOfftake">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="kode" class="form-label">Kode Transaksi</label>
                            <input type="text" class="form-control" id="kode"
                            v-model="formDariToko.kode"
                                :class="{ 'is-invalid': errors.kode }" readonly>
                            <div class="invalid-feedback" v-if="errors.kode">{{ errors.kode }}</div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label for="pelanggan" class="form-label">Pelanggan</label>
                            <input type="text" class="form-control" id="kode" v-model="formDariToko.pelanggan"
                                :class="{ 'is-invalid': errors.pelanggan }" readonly>
                            <div class="invalid-feedback" v-if="errors.pelanggan">{{ errors.pelanggan }}</div>
                        </div>
                    </div>

                    <!-- <PembelianDariTokoTable /> -->

                    <div class="mb-3">
                        <label for="keterangan" class="form-label">Keterangan / Catatan</label>
                        <textarea v-model="formDariToko.keterangan" placeholder="Masukkan keterangan tambahan"
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
</template>

<script setup>
import { onMounted } from 'vue';
import { usePembelianDariToko } from '../composables/usePembelianDariToko';
import PembelianDariTokoTable from './PembelianDariTokoTable.vue';

const {
    formDariToko,
    isLoading,
    errors,
} = usePembelianDariToko();

// onMounted(() => {
//     fetchSuplier();
//     fetchKodeTransaksi();
// });
</script>
