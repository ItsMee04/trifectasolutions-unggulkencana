<template>
    <teleport to='body'>
        <div class="modal fade" id="pembeliandetaileditModal" tabindex="-1"
            aria-labelledby="pembeliandetaileditModalModalLabel" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>EDIT PRODUK</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="mb-3">
                                        <label for="kodeproduk" class="form-label">Kode Produk</label>
                                        <input type="text" class="form-control" id="kodeproduk"
                                            v-model="formPembelianDetail.kodeproduk" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="kodeproduk" class="form-label">Harga Jual</label>
                                        <input type="text" class="form-control" id="kodeproduk"
                                            v-model="formPembelianDetail.hargajual" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="kondisi" class="form-label">Kondisi</label>
                                        <Multiselect v-model="formPembelianDetail.kondisi" :options="kondisiList"
                                            :searchable="true" label="label" track-by="value"
                                            placeholder="Pilih kondisi" id="kondisi" />
                                        <div class="invalid-feedback" v-if="errors.kondisi">{{ errors.kondisi }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="jenisHargaBeli" class="form-label">Jenis Harga Beli</label>
                                        <Multiselect v-model="hargaBeliPilihan" :options="opsiHargaBeli"
                                            :searchable="false" label="label" track-by="value"
                                            placeholder="Pilih harga beli" />
                                        <p class="mt-2 text-primary">
                                            Harga Beli Akhir: <strong>Rp {{ new
                                                Intl.NumberFormat('id-ID').format(hargaAkhir) }}</strong>
                                        </p>
                                    </div>
                                    <div class="mb-3" v-if="hargaBeliPilihan?.value === 'lebih_tinggi'">
                                        <label class="form-label">Masukkan Harga Beli Manual</label>
                                        <input type="number" class="form-control" v-model="hargaManual"
                                            placeholder="Input harga..." />
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Harga Beli Fix</label>
                                        <input type="text" class="form-control"
                                            :value="new Intl.NumberFormat('id-ID').format(formPembelianDetail.hargabeli)"
                                            readonly>
                                    </div>
                                    <div class="modal-footer-btn">
                                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                                            CANCEL
                                        </button>
                                        <button type="submit" class="btn btn-submit"
                                            :disabled="isLoadingPembelianDetail">
                                            {{ isLoadingPembelianDetail ? 'Loading...' : ('SIMPAN') }}
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
import { ref, watch, computed, onMounted } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

import { usePembelianDariToko } from '../composables/usePembelianDariToko';

const {
    errors,
    kondisiList,
    formPembelianDetail,
    isLoadingPembelianDetail,
    handleSubmitEdit,
    fetchKondisi,
} = usePembelianDariToko();

const opsiHargaBeli = [
    { label: 'Harga Jual', value: 'hargajual' },
    { label: 'Potongan 4%', value: 'potongan_4' },
    { label: 'Lebih Tinggi', value: 'lebih_tinggi' }
];

const hargaBeliPilihan = ref(opsiHargaBeli[0]);
const hargaManual = ref('');

// Logic perhitungan otomatis
const hargaAkhir = computed(() => {
    const jual = parseFloat(formPembelianDetail.hargajual || 0);

    if (hargaBeliPilihan.value?.value === 'hargajual') {
        return jual;
    }

    if (hargaBeliPilihan.value?.value === 'potongan_4') {
        // Rumus: Harga Jual - (Harga Jual * 4%) atau Harga Jual * 0.96
        return Math.round(jual * 0.96);
    }

    if (hargaBeliPilihan.value?.value === 'lebih_tinggi') {
        return Number(hargaManual.value) || 0;
    }

    return jual;
});

const resetFormDetail = () => {
    formPembelianDetail.id = null;
    formPembelianDetail.kodeproduk = '';
    formPembelianDetail.hargajual = 0;
    formPembelianDetail.hargabeli = 0;
    formPembelianDetail.jenis_hargabeli = 'hargajual';
    // Reset errors juga jika ada
    errors.value = {};
};

const handleSubmit = async () => {
    await handleSubmitEdit();
};

// 1. Sync nilai computed ke State Utama Composable
watch(hargaAkhir, (newVal) => {
    formPembelianDetail.hargabeli = newVal;
}, { immediate: true });

// 2. Sync label jenis harga ke State Utama
watch(hargaBeliPilihan, (newVal) => {
    formPembelianDetail.jenis_hargabeli = newVal?.value;
});

// 3. Reset input manual jika user pindah pilihan dari 'lebih_tinggi'
watch(hargaBeliPilihan, (newVal) => {
    if (newVal?.value !== 'lebih_tinggi') {
        hargaManual.value = '';
    }
});

// 4. Reset pilihan ke 'Harga Jual' saat modal dibuka dengan data baru
watch(() => formPembelianDetail.id, () => {
    hargaBeliPilihan.value = opsiHargaBeli[0];
    hargaManual.value = '';
});
onMounted(() => {
    fetchKondisi();
    // Tambahan: Reset form saat modal ditutup lewat tombol 'X' atau klik luar
    const modalElement = document.getElementById('pembeliandetaileditModal');

    modalElement.addEventListener('hidden.bs.modal', () => {
        // 1. Reset data di Composable [cite: 2025-10-25]
        // 1. Reset data di Composable (Shared State)
        resetFormDetail();

        // 2. Reset data lokal di komponen modal ini
        hargaBeliPilihan.value = opsiHargaBeli[0];
        hargaManual.value = '';
    });
});
</script>
