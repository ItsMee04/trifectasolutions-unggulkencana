<template>
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>DAFTAR PEGAWAI</b></div>

                <div class="d-flex align-items-center">
                    <div class="input-group input-group-sm" style="width: 250px;">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i data-feather="search" style="width: 14px; height: 14px;"></i>
                        </span>
                        <input
                            type="text"
                            class="form-control border-start-0 ps-0"
                            placeholder="Cari Pegawai..."
                            v-model="searchQuery"
                        />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table text-nowrap table-striped table-hover">
                        <thead>
                            <tr>
                                <th style="width: 5%;">NO.</th>
                                <th style="width: 20%;">NIP</th>
                                <th style="width: 20%;">NAMA</th>
                                <th style="width: 20%;">KONTAK</th>
                                <th style="width: 20%;">JABATAN</th>
                                <th style="width: 20%;">STATUS</th>
                                <th style="width: 20%;" class="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="isLoading">
                                <td colspan="7" class="text-center">
                                    <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                        aria-hidden="true"></span>
                                    Memuat data...
                                </td>
                            </tr>
                            <tr v-else-if="paginatedPegawai.length === 0">
                                <td colspan="7" class="text-center">Tidak ada data.</td>
                            </tr>
                            <tr v-else v-for="(item, index) in paginatedPegawai" :key="item.id">
                                <td scope="row">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.nip }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.nama }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.kontak }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.jabatan?.jabatan }}</span>
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
                                <td>
                                    <div class="hstack gap-2 fs-15 justify-content-center">
                                        <a href="javascript:void(0);"
                                            class="btn btn-icon btn-sm btn-soft-info rounded-pill"
                                            @click.prevent="handleEdit(item)">
                                            <i data-feather="edit" class="feather-edit"></i>
                                        </a>

                                        <a href="javascript:void(0);"
                                            class="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                                            @click.prevent="handleDelete(item)">
                                            <i data-feather="trash-2" class="feather-trash-2"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredPegawai.length > 0" class="d-flex justify-content-between align-items-center p-3">
                    <div class="text-muted small">
                        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                        {{ Math.min(currentPage * itemsPerPage, filteredPegawai.length) }} of
                        {{ filteredPegawai.length }} entries
                    </div>

                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = 1">
                                <i class="fas fa-angle-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage > 1 ? currentPage-- : null">
                                Previous
                            </a>
                        </li>
                        <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage = page">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="javascript:void(0);" @click="currentPage < totalPages && currentPage++">
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
import { usePegawai } from '../composables/usePegawai';

const {
    filteredPegawai,
    paginatedPegawai,
    currentPage,
    itemsPerPage,
    isLoading,
    searchQuery,
    displayedPages,
    totalPages,
    handleEdit,
    handleDelete
} = usePegawai();

const { initFeather } = useFeather();

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedPegawai, () => {
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
