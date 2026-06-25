<template>
    <div class="row g-3">
        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanPenjualan"
                style="cursor: pointer; transition: 0.3s;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0">LAPORAN PENJUALAN</h6>
                        <small class="text-muted">Total transaksi penjualan</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanPembelian" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN PEMBELIAN</h6>
                        <small class="text-muted">Total transaksi pembelian</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanOfftake" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN OFFTAKE</h6>
                        <small class="text-muted">Total transaksi Offtake</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanPerbaikan" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN PERBAIKAN</h6>
                        <small class="text-muted">Rekap produk perbaikan</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanStokBulanan" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN STOK BULANAN</h6>
                        <small class="text-muted">Catatan Stok</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanMutasiSaldo" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN MUTASI SALDO</h6>
                        <small class="text-muted">Catatan Pemasukan, Pengeluaran</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanNampan" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN NAMPAN / BAKI</h6>
                        <small class="text-muted">Catatan Stok</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanProduk" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN PRODUK</h6>
                        <small class="text-muted">Catatan Stok</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card border-0 shadow-sm bg-soft-info h-100" @click="cetakLaporanNampanPerBaki" style="cursor: pointer;">
                <div class="card-body p-3 d-flex align-items-center">
                    <div class="bg-white p-2 rounded me-3 shadow-sm">
                        <i data-feather="box" class="text-info" style="width: 20px;"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0 text-dark">LAPORAN NAMPAN PER BAKI</h6>
                        <small class="text-muted">Catatan Stok</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useFeather } from '../../../helper/feather'
import { useLaporan } from '../composables/useLaporan';

const { initFeather } = useFeather();

const {
    cetakLaporanPenjualan,
    cetakLaporanPembelian,
    cetakLaporanOfftake,
    cetakLaporanPerbaikan,
    cetakLaporanStokBulanan,
    cetakLaporanMutasiSaldo,
    cetakLaporanNampan,
    cetakLaporanProduk,
    cetakLaporanNampanPerBaki
} = useLaporan();

onMounted(() => {
    initFeather();
});
</script>
