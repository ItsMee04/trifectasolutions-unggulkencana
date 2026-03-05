<template>
    <div class="card shadow-sm border-0 mb-3">
        <div class="card-body p-0">
            <div class="p-3 border-bottom">
                <h6 class="fw-bold mb-3">Daftar Periode</h6>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0">
                        <i data-feather="search" style="width: 14px;"></i>
                    </span>
                    <input type="text" v-model="searchPeriodeStok" class="form-control border-start-0"
                        placeholder="Cari periode...">
                </div>
            </div>

            <div v-if="isLoadingPeriodeStok" class="p-5 text-center">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                <span>Memuat data...</span>
            </div>

            <div v-else-if="paginatedPeriodeStok.length === 0" class="p-5 text-center">
                <span class="text-muted">Tidak ada data periode</span>
            </div>

            <div v-else class="list-group list-group-flush">
                <a v-for="item in paginatedPeriodeStok" :key="item.id" @click.prevent="handlePilihPeriodeStok(item)"
                    class="list-group-item list-group-item-action border-0 py-3"
                    :class="{ 'bg-light shadow-sm active-nampan': item.id === selectedPeriodeStokID }">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <div :class="item.status === 2 ? 'bg-soft-success' : 'bg-soft-warning'"
                                class="p-2 rounded me-3">
                                <i data-feather="calendar" :class="item.status === 2 ? 'text-success' : 'text-warning'"
                                    style="width: 18px;"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold text-dark">{{ item.periode }}</span>
                                <small class="text-muted">Kode: {{ item.kode || '-' }}</small>
                            </div>
                        </div>

                        <div class="d-flex align-items-center">
                            <button v-if="item.status === 1" @click.stop="handleFinalisasiPeriode(item)"
                                class="btn-final-action">
                                <i data-feather="lock" class="me-1" style="width: 11px;"></i>
                                Final
                            </button>

                            <div v-else class="badge-final-status">
                                <i data-feather="check-circle" class="me-1" style="width: 11px;"></i>
                                Final
                            </div>
                        </div>
                    </div>
                </a>
            </div>

            <div v-if="filteredPeriodeStok.length > 0" class="p-3 border-top">
                <div class="d-flex justify-content-center align-items-center mb-2">
                    <div class="text-muted small">
                        Showing {{ (currentPagePeriodeStok - 1) * itemsPerPagePeriodeStok + 1 }} to
                        {{ Math.min(currentPagePeriodeStok * itemsPerPagePeriodeStok, filteredPeriodeStok.length) }} of
                        {{ filteredPeriodeStok.length }}
                    </div>
                </div>

                <nav class="d-flex justify-content-center">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: currentPagePeriodeStok === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPagePeriodeStok = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPagePeriodeStok === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePeriodeStok > 1 ? currentPagePeriodeStok-- : null">Prev</a>
                        </li>

                        <li v-for="page in displayedPagesPeriodeStok" :key="page" class="page-item"
                            :class="{ active: page === currentPagePeriodeStok }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPagePeriodeStok = page"
                                :style="page === currentPagePeriodeStok ? 'background-color: #ff9f43; border-color: #ff9f43;' : ''">
                                {{ page }}
                            </a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPagePeriodeStok === totalPagesPeriodeStok }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePeriodeStok < totalPagesPeriodeStok && currentPagePeriodeStok++">Next</a>
                        </li>

                        <li class="page-item" :class="{ disabled: currentPagePeriodeStok === totalPagesPeriodeStok }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPagePeriodeStok = totalPagesPeriodeStok">
                                <i class="fas fa-angle-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
    <div class="card shadow-sm border-0">
        <div class="card-body p-2">
            <div class="row g-2 align-items-center">
                <div class="col">
                    <input type="date" v-model="formPeriode.periode" :class="{ 'is-invalid': errors.periode }"
                        class="form-control form-control-sm border-light-subtle">
                </div>
                <div class="col-auto">
                    <button @click="handleCreatePeriode" class="btn btn-sm btn-secondary"
                        :disabled="isLoadingPeriodeStok" style="height: 31px; min-width: 36px;">
                        <i data-feather="plus" style="width: 12px; height: 12px;"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useFeather } from '../../../helper/feather';
import { useStock } from '../composables/useStock';

const {
    errors,
    formPeriode,
    selectedPeriodeStokID,
    selectedPeriodeStok,
    searchPeriodeStok,
    isLoadingPeriodeStok,
    currentPagePeriodeStok,
    itemsPerPagePeriodeStok,
    totalPagesPeriodeStok,
    displayedPagesPeriodeStok,
    filteredPeriodeStok,
    paginatedPeriodeStok,
    fetchPeriodeStok,
    handleCreatePeriode,
    handlePilihPeriodeStok,
    handleFinalisasiPeriode
} = useStock();

const { initFeather } = useFeather();

// Inisialisasi ikon setiap kali data berubah atau loading selesai
watch([paginatedPeriodeStok, isLoadingPeriodeStok], () => {
    initFeather();
});

onMounted(() => {
    fetchPeriodeStok();
})
</script>

<style>
.form-control.is-invalid,
.was-validated .form-control:invalid {
    background-image: none !important;
    padding-right: calc(1.5em + 0.75rem) !important;
    /* Kembalikan padding normal */
}
/* Tombol Aksi Final */
.btn-final-action {
    background-color: #ffffff;
    color: #ffc107;
    border: 1px solid #ffc107;
    border-radius: 50px;
    padding: 2px 10px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
}

.btn-final-action:hover {
    background-color: #ffc107;
    color: #ffffff;
}

/* Badge Status Final (Static) */
.badge-final-status {
    background-color: rgba(25, 135, 84, 0.1);
    color: #198754;
    border: 1px solid rgba(25, 135, 84, 0.2);
    border-radius: 50px;
    padding: 2px 10px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
}

/* Perbaikan visual agar teks periode tidak terpotong */
.active-nampan {
    border-left: 3px solid #ffc107 !important;
}
</style>
