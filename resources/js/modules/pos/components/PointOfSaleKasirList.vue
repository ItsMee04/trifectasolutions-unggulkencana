<template>
    <div class="col-md-12 col-lg-4 ps-0">
        <aside class="product-order-list">
            <div class="head d-flex align-items-center justify-content-between w-100">
                <div class>
                    <h5>DAFTAR ORDER</h5>
                    <span>ID Transaksi : #{{ TransaksiID }}</span>
                </div>
            </div>
            <div class="customer-info block-section">
                <h6>Informasi Pelanggan</h6>
                <div class="input-block d-flex align-items-center">
                    <div class="flex-grow-1">
                        <Multiselect v-model="formPOS.pelanggan" :options="PelangganList" :searchable="true"
                            label="label" track-by="value" placeholder="Pilih pelanggan" />
                        <div class="invalid-feedback" v-if="errors.pelanggan">{{ errors.pelanggan }}
                        </div>
                    </div>
                    <a href="#" class="btn btn-primary btn-icon" @click="handleCreatePelanggan">
                        <i data-feather="user-plus" class="feather-16"></i>
                    </a>
                </div>
            </div>
            <div class="scanner-container">
                <input type="text" ref="barcodeInput" v-model="scanQuery" @keyup.enter="handleBarcodeScan"
                    class="offscreen-input" placeholder="Scanner active..." />
            </div>
            <div class="product-added block-section">
                <div class="head-text d-flex align-items-center justify-content-between">
                    <h6 class="d-flex align-items-center mb-0">Produk Ditambahkan<span class="count">{{
                        TransaksiDetail.length }}</span>
                    </h6>
                    <a href="javascript:void(0);" class="d-flex align-items-center text-danger"><span class="me-1"><i
                                data-feather="x" class="feather-16"></i></span>Clear all</a>
                </div>
                <div class="product-wrap">
                    <div v-if="isLoading" class="text-center p-5">
                        <div class="spinner-border text-primary mb-3" role="status"></div>
                        <h6 class="text-muted">Memuat data...</h6>
                    </div>

                    <template v-else-if="TransaksiDetail.length > 0">
                        <div v-for="(item, index) in TransaksiDetail" :key="item.id"
                            class="product-list d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center product-info">
                                <div class="img-bg d-flex align-items-center justify-content-center bg-light"
                                    style="width: 50px; height: 50px; border-radius: 8px;">
                                    <i data-feather="package" class="feather-20 text-secondary"></i>
                                </div>
                                <div class="info ms-3">
                                    <span>{{ item.produk.kodeproduk }}</span>
                                    <h6>{{ item.produk.nama }}</h6>
                                    <p class="fw-bold text-primary">{{ formatRupiah(item.total) }}</p>
                                    <small class="text-muted">
                                        {{ item.berat }}g | {{ item.karat }}K
                                    </small>
                                </div>
                            </div>

                            <div class="d-flex align-items-center action">
                                <a class="btn-icon delete-icon confirm-text" href="javascript:void(0);"
                                    @click="handleDelete(item.id)">
                                    <i data-feather="trash-2" class="feather-16"></i>
                                </a>
                            </div>
                        </div>
                    </template>

                    <div v-else class="text-center p-5 mt-2">
                        <div class="mb-3">
                            <i data-feather="shopping-cart" class="text-light-grey"
                                style="width: 60px; height: 60px; opacity: 0.3;"></i>
                        </div>
                        <h6 class="text-muted">Keranjang Kosong</h6>
                        <p class="text-muted small">Pilih emas untuk transaksi</p>
                    </div>
                </div>
            </div>
            <div class="block-section">
                <div class="selling-info">
                    <div class="row">
                        <div class="col-12">
                            <div class="input-block">
                                <label>Diskon</label>
                                <Multiselect v-model="selectedDiskon" :options="DiskonList" :searchable="true"
                                    label="label" track-by="value" placeholder="Pilih diskon" />
                                <div class="invalid-feedback" v-if="errors.diskon">{{ errors.diskon }}
                                </div>
                            </div>
                        </div>
                        <div class="col-12 mt-2" v-if="formPOS.pelanggan && formPOS.pelanggan.point >= 10">
                            <div class="input-block">
                                <div class="form-check form-switch mb-2">
                                    <input class="form-check-input" type="checkbox" v-model="usePoint" id="switchPoint">
                                    <label class="form-check-label" for="switchPoint">Gunakan Poin</label>
                                </div>

                                <div v-if="usePoint">
                                    <input type="number" v-model.number="inputPoint" class="form-control"
                                        :max="formPOS.pelanggan.point" min="10" placeholder="Masukan jumlah poin" />
                                    <small class="text-muted">Tersedia: {{ formPOS.pelanggan.point }} Poin</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-total">
                    <table class="table table-responsive table-borderless">
                        <tr>
                            <td>Sub Total</td>
                            <td class="text-end">{{ formatRupiah(calculateSubtotal) }}</td>
                        </tr>
                        <tr>
                            <td class="danger">Diskon ({{ selectedDiskonNilai }}%)</td>
                            <td class="danger text-end">- {{ formatRupiah(calculateDiskon) }}</td>
                        </tr>
                        <tr v-if="calculatePotonganPoint > 0">
                            <td class="danger">Potongan Poin</td>
                            <td class="danger text-end">- {{ formatRupiah(calculatePotonganPoint) }}</td>
                        </tr>
                        <tr>
                            <td>Total</td>
                            <td class="text-end fw-bold">{{ formatRupiah(calculateGrandTotal) }}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="d-grid btn-block">
                <a class="btn btn-secondary" href="javascript:void(0);">
                    {{ formatRupiah(calculateGrandTotal) }}
                </a>
            </div>
            <div class="btn-row d-sm-flex align-items-center justify-content-between" :disabled="isLoading">
                <a @click="handlePayment" class="btn btn-success btn-icon flex-fill"
                    :class="{ 'disabled': isLoading || TransaksiDetail.length === 0 }">
                    <span class="me-1 d-flex align-items-center">
                        <i data-feather="credit-card" class="feather-16"></i>
                    </span>
                    {{ isLoading ? 'Memuat data...' : 'PAYMENT' }}
                </a>
            </div>
        </aside>
    </div>
</template>
<script setup>
import { onMounted, onUnmounted, computed, watch, nextTick, ref } from 'vue'; // Tambahkan onUnmounted
import { usePOS } from '../composables/usePOS';
import { useTransaksiRealtime } from '../composables/useTransaksiRealtime';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { formatRupiah } from '../../../helper/formatRupiah'
import { useFeather } from '../../../helper/feather';

// 1. Inisialisasi instance pos
const pos = usePOS();

// 2. Destrukturisasi untuk digunakan di template/script
const {
    isLoading,
    errors,
    formPOS,
    PelangganList,
    DiskonList,
    TransaksiID,
    selectedDiskon,
    selectedDiskonNilai,
    TransaksiDetail,
    fetchKodeTransaksi,
    fetchPelanggan,
    fetchDiskon,
    fetchTransaksiDetail,
    handleDelete,
    paymentTransaksi,
    usePoint,
    inputPoint,
    calculatePotonganPoint,
    scanQuery,
    handleBarcodeScan
} = pos; // Destrukturisasi dari instance 'pos'

// 3. Panggil fungsi melalui instance 'pos' agar tetap sinkron
useTransaksiRealtime(async () => {
    console.log("WebSocket: Memperbarui data via instance pos...");
    await pos.fetchTransaksiDetail();
});

// 1. Deklarasi State (Pastikan tidak duplikat)
const barcodeInput = ref(null);
const modeScanner = ref(true); // Set true jika ingin default terbuka, atau sesuaikan logika Anda

// 2. Fungsi Focus yang lebih cerdas (tidak mencuri fokus dari input lain)
const ensureFocus = (event) => {
    // 1. Cek apakah user sedang fokus ke input lain (seperti cari pelanggan atau isi poin)
    const isUserTyping = event?.target.tagName === 'INPUT' ||
        event?.target.tagName === 'TEXTAREA' ||
        event?.target.closest('.multiselect'); // Hindari mencuri fokus dari Multiselect

    if (isUserTyping) return;

    // 2. Jika tidak sedang mengetik apapun, paksa fokus kembali ke input barcode
    if (barcodeInput.value) {
        barcodeInput.value.focus();
    }
};

// 3. Watcher untuk mode scanner
watch(modeScanner, async (newVal) => {
    if (newVal) {
        await nextTick();
        if (barcodeInput.value) {
            barcodeInput.value.focus();
        }
    }
});

const calculateSubtotal = computed(() => {
    // Akses ke pos.TransaksiDetail secara langsung
    return (pos.TransaksiDetail || []).reduce((acc, item) => acc + parseFloat(item.total), 0);
});

const calculateDiskon = computed(() => {
    return (calculateSubtotal.value * (pos.selectedDiskonNilai || 0)) / 100;
});

const calculateGrandTotal = computed(() => {
    const subtotal = calculateSubtotal.value;
    const diskon = calculateDiskon.value;
    const potonganPoin = pos.calculatePotonganPoint || 0;

    return subtotal - diskon - potonganPoin;
});

const { initFeather } = useFeather();

const handlePayment = () => {
    paymentTransaksi(calculateGrandTotal.value);
};

watch(
    [TransaksiDetail, isLoading],
    async () => {
        await nextTick();
        initFeather();
    },
    { deep: true }
);

// 4. Lifecycle Hooks
onMounted(() => {
    fetchPelanggan();
    fetchDiskon();
    fetchKodeTransaksi();
    fetchTransaksiDetail();

    // Jalankan focus saat awal load
    nextTick(() => {
        ensureFocus();
    });

    // Pasang listener klik global
    // Jalankan focus pertama kali
    setTimeout(() => {
        if (barcodeInput.value) barcodeInput.value.focus();
    }, 500);

    // Pasang listener klik global agar fokus kembali jika kasir klik sembarang tempat
    document.addEventListener('click', ensureFocus);
});

// Bersihkan listener saat pindah halaman
onUnmounted(() => {
    document.removeEventListener('click', ensureFocus);
});

</script>
<style scoped>
.offscreen-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    z-index: -1;
    height: 0;
    width: 0;
}
</style>
