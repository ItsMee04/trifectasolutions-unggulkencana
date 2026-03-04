<template>
    <div class="card mb-3 border-0 shadow-sm bg-soft-primary">
        <div class="card-body p-3">
            <div class="row align-items-center text-center text-md-start">
                <div class="col-md-3 mb-2 mb-md-0 border-end">
                    <div v-if="selectedPeriodeStokData">
                        <small class="text-muted d-block">Periode</small>
                        <span class="fw-bold text-primary">
                            {{ selectedPeriodeStokData?.periode || '-' }}
                        </span>
                    </div>
                    <div v-else>
                        <span class="text-muted italic">Pilih Periode...</span>
                    </div>
                </div>

                <div class="col-md-6 mb-2 mb-md-0">
                    <div class="d-flex justify-content-around">
                        <div class="text-center">
                            <small class="text-muted d-block">MASUK</small>
                            <span class="badge bg-success">
                                {{ totalRekap?.masukUnit || 0 }} Itm /
                                {{ totalRekap?.masukBerat?.toFixed(3) || '0.000' }}g
                            </span>
                        </div>

                        <div class="text-center">
                            <small class="text-muted d-block">KELUAR</small>
                            <span class="badge bg-danger">
                                {{ totalRekap?.keluarUnit || 0 }} Itm /
                                {{ totalRekap?.keluarBerat?.toFixed(3) || '0.000' }}g
                            </span>
                        </div>
                        <div class="text-center">
                            <small class="text-muted d-block">PINDAH</small>
                            <span class="badge bg-info">{{ totalPindah }} Item</span>
                        </div>
                        <div class="text-center border-start ps-3">
                            <small class="text-muted d-block text-dark">Total Pergerakan</small>
                            <span class="fw-bold">{{ filteredNampanProduk.length }} Log</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-3 text-md-end">
                    <small class="text-muted d-block">Status Periode</small>
                    <template v-if="selectedPeriodeStokData && selectedPeriodeStokData.id">
                        <span :class="['badge', selectedPeriodeStokData.status == 1 ? 'bg-success' : 'bg-info']">
                            {{ selectedPeriodeStokData.status == 1 ? 'AKTIF' : 'FINAL' }}
                        </span>
                    </template>
                    <span v-else class="fw-bold">-</span>
                </div>
            </div>
        </div>
    </div>

    <div class="card mb-3 border-0 shadow-sm">
        <div class="card-header bg-light">
            <div class="card-title mb-0 small"><b>REKAP STOK PER JENIS</b></div>
        </div>
        <div class="table-responsive">
            <div class="table-responsive">
                <table class="table table-sm table-bordered mb-0 text-center align-middle">
                    <thead class="bg-light small text-uppercase">
                        <tr>
                            <th rowspan="2" class="align-middle px-3">Jenis</th>
                            <th colspan="2" class="py-2">Awal</th>
                            <th colspan="2" class="text-success py-2">Masuk</th>
                            <th colspan="2" class="text-danger py-2">Keluar</th>
                            <th colspan="2" class="bg-soft-primary py-2">Akhir</th>
                        </tr>
                        <tr class="small">
                            <th style="width: 8%">Pt</th>
                            <th style="width: 12%">Gr</th>
                            <th style="width: 8%">Pt</th>
                            <th style="width: 12%">Gr</th>
                            <th style="width: 8%">Pt</th>
                            <th style="width: 12%">Gr</th>
                            <th style="width: 8%">Pt</th>
                            <th style="width: 12%">Gr</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <tr v-if="isLoadingNampanProduk">
                            <td colspan="9" class="text-center py-4">
                                <span class="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="rekapDataNormalized.length === 0">
                            <td colspan="9" class="text-center py-4 text-muted italic">
                                <i class="fas fa-info-circle me-1"></i> Tidak ada data tersedia.
                            </td>
                        </tr>

                        <tr v-else v-for="rekap in rekapDataNormalized" :key="rekap.kategori">
                            <td class="text-center fw-bold px-3 bg-light">{{ rekap.kategori }}</td>
                            <td>{{ rekap.stok_awal?.unit || 0 }}</td>
                            <td>{{ rekap.stok_awal?.berat?.toFixed(2) || '0.00' }}</td>
                            <td class="text-success fw-semibold">{{ rekap.masuk?.unit || 0 }}</td>
                            <td class="text-success fw-semibold">{{ rekap.masuk?.berat?.toFixed(2) || '0.00' }}</td>
                            <td class="text-danger fw-semibold">{{ rekap.keluar?.unit || 0 }}</td>
                            <td class="text-danger fw-semibold">{{ rekap.keluar?.berat?.toFixed(2) || '0.00' }}</td>
                            <td class="fw-bold bg-soft-primary">{{ rekap.stok_akhir?.unit || 0 }}</td>
                            <td class="fw-bold bg-soft-primary">{{ rekap.stok_akhir?.berat?.toFixed(2) || '0.00' }}</td>
                        </tr>
                    </tbody>
                    <tfoot v-if="rekapDataNormalized.length > 0" class="bg-light fw-bold">
                        <tr>
                            <td class="text-end px-3">TOTAL</td>
                            <td>{{ totalRekap.awalUnit || 0 }}</td>
                            <td>{{ totalRekap.awalBerat?.toFixed(2) || '0.00' }}</td>
                            <td class="text-success">{{ totalRekap.masukUnit || 0 }}</td>
                            <td class="text-success">{{ totalRekap.masukBerat?.toFixed(2) || '0.00' }}</td>
                            <td class="text-danger">{{ totalRekap.keluarUnit || 0 }}</td>
                            <td class="text-danger">{{ totalRekap.keluarBerat?.toFixed(2) || '0.00' }}</td>
                            <td class="text-primary">{{ (totalRekap.masukUnit - totalRekap.keluarUnit) }}</td>
                            <td class="text-primary">{{ (totalRekap.masukBerat - totalRekap.keluarBerat).toFixed(2) }}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

    <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between">
            <div class="card-title mb-0"><b>DAFTAR PRODUK</b></div>

            <div class="d-flex align-items-center">
                <div class="input-group input-group-sm" style="width: 250px;">
                    <span class="input-group-text bg-transparent border-end-0">
                        <i data-feather="search" style="width: 14px; height: 14px;"></i>
                    </span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Produk..."
                        v-model="searchNampanProduk" />
                </div>
            </div>
        </div>

        <div class="card-body">
            <div class="table-responsive">
                <table class="table text-nowrap table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">NO.</th>
                            <th scope="col">PRODUK</th>
                            <th scope="col">JENIS</th>
                            <th scope="col">TANGGAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="isLoadingNampanProduk">
                            <td colspan="6" class="text-center">
                                <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                    aria-hidden="true"></span>
                                Memuat data...
                            </td>
                        </tr>
                        <tr v-else-if="paginatedNampanProduk.length === 0">
                            <td colspan="6" class="text-center">Tidak ada data.</td>
                        </tr>
                        <tr v-else v-for="(item, index) in paginatedNampanProduk" :key="item.id">
                            <td scope="row">{{ (currentPageNampanProduk - 1) * itemsPerPageNampanProduk + index + 1 }}
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.produk?.kodeproduk }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span v-if="item.jenis == 'MASUK'" class="badge bg-success">
                                    MASUK
                                </span>
                                <span v-else-if="item.jenis == 'KELUAR'" class="badge bg-danger">
                                    KELUAR
                                </span>
                                <span v-else class="badge bg-info">
                                    PINDAH
                                </span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div>
                                        <div class="lh-1">
                                            <span>{{ item.tanggal }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="filteredNampanProduk.length > 0" class="d-flex justify-content-between align-items-center p-3">
                <div class="text-muted small">
                    Showing {{ (currentPageNampanProduk - 1) * itemsPerPageNampanProduk + 1 }} to
                    {{ Math.min(currentPageNampanProduk * itemsPerPageNampanProduk, filteredNampanProduk.length) }} of
                    {{ filteredNampanProduk.length }} entries
                </div>

                <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === 1 }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk = 1">
                            <i class="fas fa-angle-double-left"></i>
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === 1 }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageNampanProduk > 1 ? currentPageNampanProduk-- : null">
                            Previous
                        </a>
                    </li>
                    <li v-for="page in displayedPagesNampanProduk" :key="page" class="page-item"
                        :class="{ active: page === currentPageNampanProduk }">
                        <a class="page-link" href="javascript:void(0);" @click="currentPageNampanProduk = page">{{ page
                            }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === totalPagesNampanProduk }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageNampanProduk < totalPagesNampanProduk && currentPageNampanProduk++">
                            Next
                        </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPageNampanProduk === totalPagesNampanProduk }">
                        <a class="page-link" href="javascript:void(0);"
                            @click="currentPageNampanProduk = totalPagesNampanProduk">
                            <i class="fas fa-angle-double-right"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue';
import { useFeather } from '../../../helper/feather';
import { useStock } from '../composables/useStock';

const {
    isLoadingNampanProduk,
    currentPageNampanProduk,
    itemsPerPageNampanProduk,
    filteredNampanProduk,
    paginatedNampanProduk,
    displayedPagesNampanProduk,
    totalPagesNampanProduk,
    selectedPeriodeStokData,
    searchNampanProduk,
    rekapstok
} = useStock();

const { initFeather } = useFeather();

const rekapDataNormalized = computed(() => {
    const raw = rekapstok.value;
    if (!raw) return [];

    if (raw.rekap && Array.isArray(raw.rekap)) {
        return raw.rekap;
    }

    return Array.isArray(raw) ? raw : [];
});

const totalRekap = computed(() => {
    const data = rekapDataNormalized.value;

    if (data.length === 0) {
        return { masukUnit: 0, masukBerat: 0, keluarUnit: 0, keluarBerat: 0 };
    }

    return data.reduce((acc, curr) => {
        acc.masukUnit += Number(curr.masuk?.unit || 0);
        acc.masukBerat += Number(curr.masuk?.berat || 0);
        acc.keluarUnit += Number(curr.keluar?.unit || 0);
        acc.keluarBerat += Number(curr.keluar?.berat || 0);
        return acc;
    }, { masukUnit: 0, masukBerat: 0, keluarUnit: 0, keluarBerat: 0 });
});

const totalPindah = computed(() => {
    if (!filteredNampanProduk.value) return 0;
    return filteredNampanProduk.value.filter(item => item.jenis === 'PINDAH').length;
});

watch(() => selectedPeriodeStokData.value, () => {
    initFeather();
});

watch([paginatedNampanProduk], () => {
    initFeather();
}, { deep: true });

watch(rekapstok, (newVal) => {
    if (newVal && !Array.isArray(newVal) && newVal.rekap) {
        rekapstok.value = newVal.rekap;
    }
}, { deep: true });

watch(isLoadingNampanProduk, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
});
</script>
