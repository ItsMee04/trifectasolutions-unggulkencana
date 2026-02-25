<template>
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>TRANSAKSI OFFTAKE</b></div>
            </div>
            <div class="card-body">
                <form @submit.prevent="paymentOfftake">
                    <div class="mb-3">
                        <label for="kode" class="form-label">Kode Transaksi</label>
                        <input type="text" class="form-control" id="kode" v-model="formOfftake.kode"
                            :class="{ 'is-invalid': errors.kode }" readonly>
                        <div class="invalid-feedback" v-if="errors.kode">{{ errors.kode }}</div>
                    </div>

                    <div class="mb-3">
                        <label for="suplier" class="form-label">Suplier</label>
                        <Multiselect
                            v-model="formOfftake.suplier"
                            :options="suplierList"
                            :searchable="true"
                            label="label"
                            track-by="value"
                            placeholder="Pilih suplier"
                            id="suplier"
                            :class="{ 'is-invalid': errors.suplier }"
                        />
                        <div class="text-danger small mt-1" v-if="errors.suplier">{{ errors.suplier }}</div>
                    </div>

                    <OfftakeTable />

                    <div class="mb-3">
                        <label for="hargatotal" class="form-label">Harga Total (Dana Masuk)</label>
                        <input type="text" class="form-control" id="hargatotal" v-model="formOfftake.harga"
                            :class="{ 'is-invalid': errors.harga }">
                        <div class="invalid-feedback" v-if="errors.harga">{{ errors.harga }}</div>
                    </div>

                    <div class="mb-3">
                        <label for="keterangan" class="form-label">Keterangan / Catatan</label>
                        <textarea v-model="formOfftake.keterangan" placeholder="Masukkan keterangan tambahan" class="form-control"
                            :class="{ 'is-invalid': errors.keterangan }" id="keterangan" rows="3" />
                        <div class="invalid-feedback" v-if="errors.keterangan">{{ errors.keterangan }}</div>
                    </div>

                    <div class="text-end">
                        <button type="submit" class="btn btn-primary" :disabled="isLoading">
                            <span v-if="isLoading">
                                <i class="fas fa-spinner fa-spin me-1"></i> Memuat data...
                            </span>
                            <span v-else>PAYMENT (TERIMA DANA)</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { useOfftake } from '../composables/useOfftake';
import OfftakeTable from './OfftakeTable.vue';

const {
    suplierList,
    isLoading,
    errors,
    formOfftake,
    fetchSuplier,
    fetchKodeTransaksi,
    paymentOfftake, // Ambil fungsi submitPayment dari composable
} = useOfftake();

onMounted(() => {
    fetchSuplier();
    fetchKodeTransaksi();
});
</script>
