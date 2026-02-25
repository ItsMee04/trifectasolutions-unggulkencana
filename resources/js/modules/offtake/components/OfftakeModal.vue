<template>
    <teleport to='body'>
        <div class="modal fade" id="offtakeModal" tabindex="-1" aria-labelledby="offtakeModalLabel"
            aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered modal-lg custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>TAMBAH PRODUK</h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body custom-modal-body">
                                <form @submit.prevent="handleSubmit">
                                    <div class="card">
                                        <div class="card-header d-flex align-items-center justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <div class="input-group input-group-sm" style="width: 250px;">
                                                    <span class="input-group-text bg-transparent border-end-0">
                                                        <i data-feather="search" style="width: 14px; height: 14px;"></i>
                                                    </span>
                                                    <input type="text" class="form-control border-start-0 ps-0"
                                                        placeholder="Cari Produk..." v-model="searchProdukQuery" />
                                                </div>
                                            </div>
                                        </div>

                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table text-nowrap table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th class="no-sort">
                                                                <label class="checkboxs">
                                                                    <input type="checkbox" @change="handleSelectAll"
                                                                        :checked="selectedProdukIds.length === paginatedProduk.length && paginatedProduk.length > 0" />
                                                                    <span class="checkmarks"></span>
                                                                </label>
                                                            </th>
                                                            <th scope="col">NO.</th>
                                                            <th scope="col">KODE PRODUK</th>
                                                            <th scope="col">NAMA</th>
                                                            <th scope="col">BERAT</th>
                                                            <th scope="col">KARAT</th>
                                                            <th scope="col">STATUS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-if="isLoadingProduk">
                                                            <td colspan="7" class="text-center">
                                                                <span
                                                                    class="spinner-border spinner-border-sm me-2 text-secondary"
                                                                    role="status" aria-hidden="true"></span>
                                                                Memuat data...
                                                            </td>
                                                        </tr>
                                                        <tr v-else-if="paginatedProduk.length === 0">
                                                            <td colspan="7" class="text-center">Tidak ada data.</td>
                                                        </tr>
                                                        <tr v-else v-for="(item, index) in paginatedProduk"
                                                            :key="item.id">
                                                            <td>
                                                                <label class="checkboxs">
                                                                    <input type="checkbox" :value="item.id"
                                                                        v-model="selectedProdukIds" />
                                                                    <span class="checkmarks"></span>
                                                                </label>
                                                            </td>
                                                            <td scope="row">{{ (currentPageProduk - 1) *
                                                                itemsPerPageProduk + index + 1 }}</td>
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
                                                                <div class="d-flex align-items-center">
                                                                    <div>
                                                                        <div class="lh-1">
                                                                            <span>{{ item.produk?.nama }}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="d-flex align-items-center">
                                                                    <div>
                                                                        <div class="lh-1">
                                                                            <span>{{ item.produk?.berat }}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div class="d-flex align-items-center">
                                                                    <div>
                                                                        <div class="lh-1">
                                                                            <span>{{ item.produk?.karat?.karat }}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span v-if="item.status == 1" class="badge bg-success">
                                                                    ACTIVE
                                                                </span>
                                                                <span v-else class="badge bg-danger">
                                                                    INACTIVE
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div v-if="filteredProduk.length > 0"
                                                class="d-flex justify-content-between align-items-center p-3">
                                                <div class="text-muted small">
                                                    Showing {{ (currentPageProduk - 1) * itemsPerPageProduk
                                                        + 1 }} to
                                                    {{ Math.min(currentPageProduk * itemsPerPageProduk,
                                                        filteredProduk.length) }} of
                                                    {{ filteredProduk.length }} entries
                                                </div>

                                                <ul class="pagination mb-0">
                                                    <li class="page-item"
                                                        :class="{ disabled: currentPageProduk === 1 }">
                                                        <a class="page-link" href="javascript:void(0);"
                                                            @click="currentPageProduk = 1">
                                                            <i class="fas fa-angle-double-left"></i>
                                                        </a>
                                                    </li>
                                                    <li class="page-item"
                                                        :class="{ disabled: currentPageProduk === 1 }">
                                                        <a class="page-link" href="javascript:void(0);"
                                                            @click="currentPageProduk > 1 ? currentPageProduk-- : null">
                                                            Previous
                                                        </a>
                                                    </li>
                                                    <li v-for="page in displayedPagesProduk" :key="page"
                                                        class="page-item"
                                                        :class="{ active: page === currentPageProduk }">
                                                        <a class="page-link" href="javascript:void(0);"
                                                            @click="currentPageProduk = page">{{ page }}</a>
                                                    </li>
                                                    <li class="page-item"
                                                        :class="{ disabled: currentPageProduk === totalPagesProduk }">
                                                        <a class="page-link" href="javascript:void(0);"
                                                            @click="currentPageProduk < totalPagesProduk && currentPageProduk++">
                                                            Next
                                                        </a>
                                                    </li>
                                                    <li class="page-item"
                                                        :class="{ disabled: currentPageProduk === totalPagesProduk }">
                                                        <a class="page-link" href="javascript:void(0);"
                                                            @click="currentPageProduk = totalPagesProduk">
                                                            <i class="fas fa-angle-double-right"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer-btn">
                                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                                            CANCEL
                                        </button>
                                        <button type="submit" class="btn btn-submit" :disabled="isLoadingProduk">
                                            {{ isLoadingProduk ? 'Loading...' : 'SIMPAN' }}
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
import { onMounted, watch } from 'vue';
import { useFeather } from '../../../helper/feather';
import { useOfftake } from '../composables/useOfftake';

// Ambil state dari composable
const {
    isLoadingProduk,
    currentPageProduk,
    itemsPerPageProduk,
    filteredProduk,
    paginatedProduk,
    displayedPagesProduk,
    totalPagesProduk,
    searchProdukQuery,
    selectedProdukIds,
    submitProduk,
} = useOfftake();
const { initFeather } = useFeather();

// Di dalam NampanProdukModal.vue atau Composable
const handleSelectAll = (event) => {
    if (event.target.checked) {
        // Tambahkan semua ID dari halaman aktif yang belum ada di array
        paginatedProduk.value.forEach(item => {
            if (!selectedProdukIds.value.includes(item.id)) {
                selectedProdukIds.value.push(item.id);
            }
        });
    } else {
        // Hapus ID yang ada di halaman aktif dari array
        const currentIds = paginatedProduk.value.map(item => item.id);
        selectedProdukIds.value = selectedProdukIds.value.filter(id => !currentIds.includes(id));
    }
};

const handleSubmit = async () => {
    await submitProduk();
};

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedProduk, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoadingProduk, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
    const modalElement = document.getElementById('offtakeModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
            // Reset array menjadi kosong setiap modal tertutup
            selectedProdukIds.value = [];
        });
    }
});
</script>
