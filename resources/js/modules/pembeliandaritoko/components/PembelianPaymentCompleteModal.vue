<template>
    <teleport to='body'>
        <div class="modal fade" id="paymentCompleteModal" tabindex="-1" aria-labelledby="paymentCompleteModalLabel" aria-hidden="true"
            data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="icon-head mb-3">
                            <a href="javascript:void(0);">
                                <i data-feather="check-circle" class="feather-40 text-success"></i>
                            </a>
                        </div>
                        <h4>Pembayaran Berhasil</h4>
                        <p class="mb-0">Apakah Anda ingin mencetak struk untuk pesanan ini?</p>
                        <div class="modal-footer d-sm-flex justify-content-between p-0 mt-4 border-0">
                            <button type="button" class="btn btn-primary flex-fill me-2" @click="handlePrintNota">
                                Cetak Nota Transaksi <i data-feather="printer" class="feather-16 ms-1"></i>
                            </button>
                            <button type="button" class="btn btn-secondary flex-fill" @click="handleNextOrder"
                                data-bs-dismiss="modal">
                                Order Berikutnya <i data-feather="arrow-right-circle" class="feather-16 ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>
<script setup>
import { usePembelianDariToko } from '../composables/usePembelianDariToko';
const {
    handleNextOrder,
    handlePrintNota,
} = usePembelianDariToko();
</script>
