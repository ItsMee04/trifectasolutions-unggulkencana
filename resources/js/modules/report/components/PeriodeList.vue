<template>
    <div class="card shadow-sm border-0 mb-3">
        <div class="card-body py-4">
            <div class="text-center mb-4">
                <div class="d-flex align-items-center justify-content-center">
                    <i data-feather="file-text" class="text-primary me-2" style="width: 20px;"></i>
                    <h6 class="fw-bold mb-0">Filter Laporan Stok Harian</h6>
                </div>
                <p class="text-muted small mt-1">Silakan pilih rentang tanggal laporan</p>
            </div>
            <form>
                <div class="row g-3 justify-content-center">
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Dari Tanggal</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i data-feather="calendar" style="width: 14px;"></i>
                            </span>
                            <input type="date" v-model="formLaporan.tanggaldari"  class="form-control border-start-0">
                        </div>
                        <div class="invalid-feedback d-block" style="font-size: 11px; min-height: 15px;">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-muted">Sampai Tanggal</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i data-feather="calendar" style="width: 14px;"></i>
                            </span>
                            <input type="date" v-model="formLaporan.tanggalsampai" class="form-control border-start-0">
                        </div>
                        <div class="invalid-feedback d-block" style="font-size: 11px; min-height: 15px;">
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useFeather } from '../../../helper/feather'
import { useLaporan } from '../composables/useLaporan';

const {
    formLaporan,
} = useLaporan();

const { initFeather } = useFeather();

onMounted(() => {
    initFeather();
});
</script>
