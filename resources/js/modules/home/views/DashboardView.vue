<template>
    <div class="content">
        <div class="row">
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-widget w-100">
                    <div class="dash-widgetimg">
                        <span><img src="/public/assets/img/icons/dash1.svg" alt="img"></span>
                    </div>
                    <div class="dash-widgetcontent">
                        <h5 v-if="isLoading">Memuat data...</h5>
                        <h5 v-else>
                            <span>{{ formatRupiah(displaySaldoKeluar) }}</span>
                        </h5>
                        <h6>Total Saldo Keluar</h6>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-widget dash1 w-100">
                    <div class="dash-widgetimg">
                        <span><img src="/public/assets/img/icons/dash2.svg" alt="img"></span>
                    </div>
                    <div class="dash-widgetcontent">
                        <h5 v-if="isLoading">Memuat data...</h5>
                        <h5 v-else>
                            <span>{{ formatRupiah(displaySaldo) }}</span>
                        </h5>
                        <h6>Total Saldo Masuk</h6>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-widget dash2 w-100">
                    <div class="dash-widgetimg">
                        <span><img src="/public/assets/img/icons/dash3.svg" alt="img"></span>
                    </div>
                    <div class="dash-widgetcontent">
                        <h5 v-if="isLoading">Memuat data...</h5>
                        <h5 v-else>
                            <span>{{ formatRupiah(displayTotalPenjualanMasuk) }}</span>
                        </h5>
                        <h6>Total Transanksi Penjualan</h6>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-widget dash3 w-100">
                    <div class="dash-widgetimg">
                        <span><img src="/public/assets/img/icons/dash4.svg" alt="img"></span>
                    </div>
                    <div class="dash-widgetcontent">
                        <h5 v-if="isLoading">Memuat data...</h5>
                        <h5 v-else>
                            <span>{{ formatRupiah(displayTotalPenjualanKeluar) }}</span>
                        </h5>
                        <h6>Total Transanksi Pembelian</h6>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-count">
                    <div class="dash-counts">
                        <h4>{{ displayTotalPelanggan }}</h4>
                        <h5>Pelanggan</h5>
                    </div>
                    <div class="dash-imgs">
                        <i data-feather="user"></i>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-count das1">
                    <div class="dash-counts">
                        <h4>{{ displayTotalSuplier }}</h4>
                        <h5>Suplier</h5>
                    </div>
                    <div class="dash-imgs">
                        <i data-feather="user-check"></i>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-count das2">
                    <div class="dash-counts">
                        <h4>{{ displayTotalTransaksi }}</h4>
                        <h5>Total Jumlah Penjualan</h5>
                    </div>
                    <div class="dash-imgs">
                        <img src="/public/assets/img/icons/file-text-icon-01.svg" class="img-fluid" alt="icon">
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-sm-6 col-12 d-flex">
                <div class="dash-count das3">
                    <div class="dash-counts">
                        <h4>{{ displayTotalPembelian }}</h4>
                        <h5>Total Jumlah Pembelian</h5>
                    </div>
                    <div class="dash-imgs">
                        <i data-feather="file"></i>
                    </div>
                </div>
            </div>
        </div>

        <SalesChart />
        <HargaEmas />

    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { formatRupiah } from '../../../helper/formatRupiah'; // Pastikan path benar
import { useHome } from '../composables/useDashboard';

import SalesChart from '../components/SalesChart.vue';
import HargaEmas from '../components/HargaEmas.vue';

// Ambil variabel dan function dari composable
const {
    displaySaldo,
    displaySaldoKeluar,
    displayTotalPenjualanMasuk,
    displayTotalPenjualanKeluar,
    displayTotalPelanggan,
    displayTotalSuplier,
    displayTotalTransaksi,
    displayTotalPembelian,
    isLoading,
    fetchDashboardData
} = useHome();

onMounted(() => {
    fetchDashboardData();
});
</script>
