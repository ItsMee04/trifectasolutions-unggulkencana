<template>
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>DAFTAR DISKON</b></div>

                <div class="d-flex align-items-center">
                    <div class="input-group input-group-sm" style="width: 250px;">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i data-feather="search" style="width: 14px; height: 14px;"></i>
                        </span>
                        <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Kode Perbaikan..."
                            v-model="searchQuery" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th scope="col">NO.</th>
                                <th scope="col">KODE PERBAIKAN</th>
                                <th scope="col">KODE PRODUK</th>
                                <th scope="col">KONDISI</th>
                                <th scope="col">KETERANGAN</th>
                                <th scope="col">TANGGAL MASUK</th>
                                <th scope="col">TANGGAL KELUAR</th>
                                <th scope="col">STATUS</th>
                                <th scope="col" class="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="isLoading">
                                <td colspan="9" class="text-center">
                                    <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                        aria-hidden="true"></span>
                                    Memuat data...
                                </td>
                            </tr>
                            <tr v-else-if="paginatedPerbaikan.length === 0">
                                <td colspan="9" class="text-center">Tidak ada data.</td>
                            </tr>
                            <tr v-else v-for="(item, index) in paginatedPerbaikan" :key="item.id">
                                <td scope="row">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.kode }}</span>
                                            </div>
                                        </div>
                                    </div>
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
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.kondisi?.kondisi }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style="max-width: 250px;">
                                    <div class="position-relative keterangan-container">
                                        <div class="text-truncate" style="cursor: help;">
                                            {{ item.keterangan || '-' }}
                                        </div>

                                        <div v-if="item.keterangan && item.keterangan.length > 20"
                                            class="keterangan-popover">
                                            <div class="popover-content">
                                                <strong>Keterangan Lengkap:</strong>
                                                <hr class="my-1">
                                                {{ item.keterangan }}
                                            </div>
                                            <div class="popover-arrow"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.tanggalmasuk }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span v-if="item.tanggalkeluar != null" class="badge bg-success">
                                                    {{ item.tanggalkeluar }}
                                                </span>
                                                <span v-else class="badge bg-danger">
                                                    PRODUK MASIH DALAM PERBAIKAN
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span v-if="item.status == 1" class="badge bg-success">
                                                    ACTIVE
                                                </span>
                                                <span v-else-if="item.status == 2" class="badge bg-info">
                                                    SELESAI
                                                </span>
                                                <span v-else class="badge bg-info">
                                                    BATAL
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="action-table-data justify-content-center">
                                    <div class="edit-delete-action">
                                        <div v-if="item.status == 1" class="edit-delete-action">
                                            <a class="me-2 p-2" @click.prevent="handleFinal(item)">
                                                <i data-feather="check-square" class="feather-edit"></i>
                                            </a>
                                            <a class="confirm-text p-2" @click.prevent="handleDelete(item)">
                                                <i data-feather="minus-square" class="feather-trash-2"></i>
                                            </a>
                                        </div>
                                        <div v-else class="d-flex align-items-center">
                                            <div>
                                                <div class="lh-1">
                                                    <span class="badge bg-info">
                                                        SELESAI
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredPerbaikan.length > 0" class="d-flex justify-content-between align-items-center p-3">
                    <div class="text-muted small">
                        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                        {{ Math.min(currentPage * itemsPerPage, filteredPerbaikan.length) }} of
                        {{ filteredPerbaikan.length }} entries
                    </div>

                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPage > 1 ? currentPage-- : null">
                                Previous
                            </a>
                        </li>
                        <li v-for="page in displayedPages" :key="page" class="page-item"
                            :class="{ active: page === currentPage }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = page">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="javascript:void(0);"
                                @click="currentPage < totalPages && currentPage++">
                                Next
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = totalPages">
                                <i class="fas fa-angle-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, watch } from 'vue';
import { useFeather } from '../../../helper/feather';
import { usePerbaikan } from '../composables/usePerbaikan';

const {

    filteredPerbaikan,
    paginatedPerbaikan,
    currentPage,
    itemsPerPage,
    isLoading,
    searchQuery,
    displayedPages,
    totalPages,
    handleFinal,
    handleDelete
} = usePerbaikan();

const { initFeather } = useFeather();

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedPerbaikan, () => {
    initFeather();
}, { deep: true });

// Pantau juga saat loading selesai
watch(isLoading, (status) => {
    if (!status) initFeather();
});

onMounted(() => {
    initFeather();
});
</script>

<style>
/* Kontainer Utama */
.keterangan-container {
    padding: 5px 0;
}

/* Sembunyikan popover secara default */
.keterangan-popover {
    display: none;
    position: absolute;
    bottom: 120%;
    /* Muncul di atas teks */
    left: 0;
    z-index: 1050;
    width: 350px;
    /* Lebar pop-up */
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;
    padding: 15px;
    animation: fadeIn 0.2s ease-out;
}

/* Munculkan saat kontainer di-hover */
.keterangan-container:hover .keterangan-popover {
    display: block;
}

/* Isi Pop-up */
.popover-content {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #333;
    white-space: normal;
    /* Biarkan teks membungkus ke bawah */
    word-break: break-word;
}

/* Panah kecil di bawah pop-up */
.popover-arrow {
    position: absolute;
    top: 100%;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #ffffff;
}

/* Animasi halus */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Pastikan kolom aksi tetap rapi */
.table td {
    vertical-align: middle !important;
}
</style>
