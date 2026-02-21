<template>
    <div class="col-xl-12">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="card-title mb-0"><b>DAFTAR NAMPAN</b></div>

                <div class="d-flex align-items-center">
                    <div class="input-group input-group-sm" style="width: 250px;">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i data-feather="search" style="width: 14px; height: 14px;"></i>
                        </span>
                        <input type="text" class="form-control border-start-0 ps-0" placeholder="Cari Nampan..."
                            v-model="searchQuery" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table text-nowrap table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col">NO.</th>
                                <th scope="col">NAMPAN</th>
                                <th scope="col">JENIS NAMPAN</th>
                                <th scope="col">STATUS</th>
                                <th scope="col" class="text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="isLoading">
                                <td colspan="5" class="text-center">
                                    <span class="spinner-border spinner-border-sm me-2 text-secondary" role="status"
                                        aria-hidden="true"></span>
                                    Memuat data...
                                </td>
                            </tr>
                            <tr v-else-if="paginatedNampan.length === 0">
                                <td colspan="5" class="text-center">Tidak ada data.</td>
                            </tr>
                            <tr v-else v-for="(item, index) in paginatedNampan" :key="item.id">
                                <td scope="row">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.nampan }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="lh-1">
                                                <span>{{ item.jenisproduk?.jenis }}</span>
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
                                <td class="action-table-data justify-content-center">
                                    <div class="edit-delete-action">
                                        <a class="me-2 p-2" @click.prevent="handleEdit(item)">
                                            <i data-feather="edit" class="feather-edit"></i>
                                        </a>
                                        <a class="confirm-text p-2"  @click.prevent="handleDelete(item)">
                                            <i data-feather="trash-2" class="feather-trash-2"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="filteredNampan.length > 0" class="d-flex justify-content-between align-items-center p-3">
                    <div class="text-muted small">
                        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                        {{ Math.min(currentPage * itemsPerPage, filteredNampan.length) }} of
                        {{ filteredNampan.length }} entries
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
import { useNampan } from '../composables/useNampan';

const {
    filteredNampan,
    paginatedNampan,
    currentPage,
    itemsPerPage,
    isLoading,
    searchQuery,
    displayedPages,
    totalPages,
    handleEdit,
    handleDelete
} = useNampan();

const { initFeather } = useFeather();

// SOLUSI: Pantau perubahan data agar feather.replace() dijalankan ulang
watch(paginatedNampan, () => {
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
