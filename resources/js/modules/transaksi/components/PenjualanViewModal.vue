<template>
    <teleport to='body'>
        <div class="modal fade" id="penjualanviewModal" tabindex="-1" aria-labelledby="penjualanviewModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div v-if="selectedTransaction" class="page-wrapper-new p-0">
                        <div class="content">
                            <div class="page-header p-4 border-bottom mb-0 d-print-none">
                                <div class="add-item d-flex align-items-center">
                                    <div class="page-title modal-datail">
                                        <h4 class="mb-0 me-2">DETAIL TRANSAKSI <b class="text-warning">{{
                                            selectedTransaction.kode }}</b></h4>
                                    </div>
                                </div>
                                <ul class="table-top-head">
                                    <li>
                                        <a class="btn btn-icon btn-sm btn-soft-secondary rounded"
                                            @click="selectedTransaction ? handlePrintNota() : null"
                                            data-bs-toggle="tooltip" title="CETAK NOTA TRANSAKSI">
                                            <i class="fas fa-print"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div class="card border-0">
                                <div class="card-body pb-0">
                                    <div class="invoice-box table-height"
                                        style="max-width: 1600px; width: 100%; padding: 0;">
                                        <div v-if="!selectedTransaction" class="text-center py-5">
                                            <div class="spinner-border text-primary" role="status"></div>
                                            <p class="mt-2">Memuat detail transaksi...</p>
                                        </div>

                                        <div>
                                            <div class="row sales-details-items d-flex">
                                                <div class="col-md-4 details-item">
                                                    <h6>PELANGGAN</h6>
                                                    <h4 class="mb-1">{{ selectedTransaction?.pelanggan?.nama }}</h4>
                                                    <p class="mb-0">{{ selectedTransaction?.pelanggan?.alamat }}</p>
                                                    <p class="mb-0">{{ selectedTransaction?.pelanggan?.kontak }}</p>
                                                </div>

                                                <div class="col-md-4 details-item">
                                                    <h6>TOKO</h6>
                                                    <h4 class="mb-1">UNGGUL KENCANA</h4>
                                                    <p class="mb-0">
                                                        Ruko No. 8, Jl. Patimura, Karang Lewas, Purwokerto, Banyumas,
                                                        Jawa Tengah
                                                    </p>
                                                    <p class="mb-0">Telp <span>0822 2537 7888</span></p>
                                                </div>

                                                <div class="col-md-4 details-item">
                                                    <h6>FAKTUR</h6>
                                                    <p class="mb-0">
                                                        No. Transaksi:
                                                        <span class="fs-16 text-primary ms-2">#{{
                                                            selectedTransaction?.kode }}</span>
                                                    </p>
                                                    <p class="mb-0">
                                                        Tanggal: <span class="ms-2 text-gray-9">{{
                                                            selectedTransaction?.tanggal }}</span>
                                                    </p>
                                                    <p class="mb-0">
                                                        Status:
                                                        <span v-if="selectedTransaction.status == 1"
                                                            class="badge bg-danger text-muted">
                                                            BELUM SELESAI
                                                        </span>
                                                        <span v-else class="badge badge-xs bg-soft bg-success">
                                                            SELESAI
                                                        </span>
                                                    </p>
                                                    <p class="mb-0">
                                                        Sales: <span class="ms-2 text-gray-9">{{
                                                            selectedTransaction?.tanggal }}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <h5 class="order-text">DETAIL PESANAN</h5>
                                            <div class="table-responsive no-pagination mb-3">
                                                <table class="table" id="transaksiProduk">
                                                    <thead>
                                                        <tr>
                                                            <th>KODE PRODUK</th>
                                                            <th>NAMA PRODUK</th>
                                                            <th>HARGA</th>
                                                            <th>TOTAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-if="isLoading">
                                                            <td colspan="4" class="text-center py-4">
                                                                <div class="spinner-border text-primary" role="status">
                                                                </div>
                                                                <p class="mt-2 mb-0">Memuat data produk...</p>
                                                            </td>
                                                        </tr>

                                                        <tr
                                                            v-else-if="selectedTransaction && selectedTransaction.transaksidetail">
                                                            <td>{{
                                                                selectedTransaction.transaksidetail.produk?.kodeproduk
                                                                || '-' }}</td>
                                                            <td>{{ selectedTransaction.transaksidetail.produk?.nama ||
                                                                '-' }}</td>
                                                            <td>{{
                                                                formatRupiah(selectedTransaction.transaksidetail.hargajual)
                                                            }}</td>
                                                            <td>{{ formatRupiah(selectedTransaction.total) }}</td>
                                                        </tr>

                                                        <tr v-else>
                                                            <td colspan="4" class="text-center">Tidak ada produk dalam
                                                                transaksi ini.</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div class="row">
                                                <div class="col-lg-6 ms-auto">
                                                    <div class="total-order w-100 max-widthauto m-auto mb-4">
                                                        <ul class="border-1 rounded-1">
                                                            <li class="border-bottom">
                                                                <h4 class="border-end">Sub Total</h4>
                                                                <h5 class="text-danger">
                                                                    {{
                                                                    formatRupiah(selectedTransaction?.transaksidetail?.total)
                                                                    }}
                                                                </h5>
                                                            </li>
                                                            <li class="border-bottom">
                                                                <h4 class="border-end">Diskon</h4>
                                                                <h5 class="text-secondary">
                                                                    ({{ selectedTransaction?.diskon?.diskon }}%) -
                                                                    {{ formatRupiah(selectedTransaction?.diskon) }}
                                                                </h5>
                                                            </li>
                                                            <li class="border-bottom">
                                                                <h4 class="border-end">Total</h4>
                                                                <h5 class="text-success">
                                                                    {{ formatRupiah(selectedTransaction?.total) }}
                                                                </h5>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> <!-- end else -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> <!-- modal-content -->
        </div> <!-- modal-dialog -->
    </teleport>
</template>
<script setup>
import { usePenjualan } from '../composable/usePenjualan';
import { formatRupiah } from '../../../helper/formatRupiah'
const {
    isLoading,
    selectedTransaction,
    handlePrintNota,
} = usePenjualan();
</script>
