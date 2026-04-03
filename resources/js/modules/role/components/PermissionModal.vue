<template>
    <teleport to="body">
        <div class="modal fade" id="permissionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-xl modal-dialog-centered custom-modal-two">
                <div class="modal-content">
                    <div class="page-wrapper-new p-0">
                        <div class="content">
                            <div
                                class="modal-header border-0 custom-modal-header d-flex justify-content-between align-items-center">
                                <div class="page-title">
                                    <h4>HAK AKSES ROLE: <span class="text-primary">{{ formRole.role }}</span></h4>
                                </div>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                            <div class="modal-body custom-modal-body p-0">
                                <div v-if="loadingPermission" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <p class="mt-2 text-muted">Memuat data hak akses...</p>
                                </div>

                                <div v-else class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 35%" class="ps-4">NAMA MENU</th>
                                                <th class="text-center">LIHAT</th>
                                                <th class="text-center">TAMBAH</th>
                                                <th class="text-center">UBAH</th>
                                                <th class="text-center">HAPUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-for="(group, gKey) in structuredMenus" :key="gKey">
                                                <tr class="bg-light-primary">
                                                    <td colspan="5"
                                                        class="fw-bold ps-4 text-primary small text-uppercase"
                                                        style="letter-spacing: 1px;">
                                                        <i data-feather="grid" class="feather-14 me-1"></i> {{
                                                        group.header }}
                                                    </td>
                                                </tr>

                                                <tr v-for="menu in group.flatMenus" :key="menu.key">
                                                    <td class="ps-5">
                                                        <i
                                                            :class="['fas fa-chevron-right me-2 small text-muted', { 'ms-3': menu.isSub }]"></i>
                                                        <span :class="{ 'fw-medium': !menu.isSub }">{{ menu.label
                                                            }}</span>
                                                    </td>
                                                    <td v-for="col in ['can_view', 'can_create', 'can_edit', 'can_delete']"
                                                        :key="col" class="text-center">
                                                        <div class="form-check form-switch d-inline-block">
                                                            <input class="form-check-input pointer" type="checkbox"
                                                                :checked="checkActive(menu.key, col)"
                                                                @change="handleToggle(menu.key, col, $event.target.checked)">
                                                        </div>
                                                    </td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="modal-footer-btn p-3">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">TUTUP</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue';
import { usePermission } from '../composables/usePermission';
import { useRole } from '../composables/useRole';

const { permissions, loadingPermission, togglePermission } = usePermission();
const { formRole } = useRole();

// Import feather untuk icon header grup jika diperlukan
import feather from 'feather-icons';

const structuredMenus = computed(() => {
    const rawGroups = {
        main: {
            header: 'Main',
            items: [{ key: 'dashboard', label: 'Dashboard' }]
        },
        usermanagement: {
            header: 'User Management',
            items: [
                { key: 'jabatan', label: 'Jabatan', isSub: true },
                { key: 'pegawai', label: 'Pegawai', isSub: true },
                { key: 'role', label: 'Role', isSub: true },
                { key: 'users', label: 'User', isSub: true },
            ]
        },
        product: {
            header: 'Produk',
            items: [
                { key: 'kondisi', label: 'Kondisi', isSub: true },
                { key: 'karat', label: 'Karat', isSub: true },
                { key: 'jeniskarat', label: 'Jenis Karat', isSub: true },
                { key: 'harga', label: 'Harga', isSub: true },
                { key: 'diskon', label: 'Diskon', isSub: true },
                { key: 'jenisproduk', label: 'Jenis Produk', isSub: true },
                { key: 'produk', label: 'Produk', isSub: true },
            ]
        },
        nampan: {
            header: 'Nampan',
            items: [
                { key: 'nampan', label: 'Nampan', isSub: true },
                { key: 'nampanproduk', label: 'Nampan Produk', isSub: true },
            ]
        },
        pelanggan: {
            header: 'Pelanggan & Relasi',
            items: [
                { key: 'pelanggan', label: 'Pelanggan', isSub: true },
                { key: 'suplier', label: 'Suplier', isSub: true },
                { key: 'pesan', label: 'Pesan', isSub: true },
            ]
        },
        keuangan: {
            header: 'Keuangan',
            items: [
                { key: 'saldo', label: 'Saldo' },
                { key: 'mutasisaldo', label: 'Mutasi Saldo' },
            ]
        },
        transaksi: {
            header: 'Transaksi',
            items: [
                { key: 'transaksi', label: 'POS' },
                { key: 'offtake', label: 'Offtake' },
                { key: 'pembeliandaritoko', label: 'Pembelian Dari Toko', isSub: true },
                { key: 'pembeliandariluartoko', label: 'Pembelian Dari Luar Toko', isSub: true },
                { key: 'perbaikan', label: 'Perbaikan' },
            ]
        },
        sales: {
            header: 'Sales (Riwayat)',
            items: [
                { key: 'transaksipenjualan', label: 'Transaksi Penjualan' },
                { key: 'transaksipembelian', label: 'Transaksi Pembelian' },
                { key: 'transaksiofftake', label: 'Transaksi Offtake' },
            ]
        },
        laporan: {
            header: 'Laporan',
            items: [
                { key: 'inventory', label: 'Inventori' },
                { key: 'laporantransaksi', label: 'Laporan Transaksi' },
            ]
        }
    };

    return Object.values(rawGroups).map(group => ({
        header: group.header,
        flatMenus: group.items
    }));
});

const checkActive = (menuKey, column) => {
    if (!permissions.value) return false;
    const perm = permissions.value.find(p => p.menu_name === menuKey);
    return perm ? perm[column] === 1 : false;
};

const handleToggle = async (menuKey, column, isChecked) => {
    if (!formRole.id) return;
    await togglePermission(formRole.id, menuKey, column, isChecked);
};

onMounted(() => {
    feather.replace();
});
</script>

<style scoped>
.bg-light-primary {
    background-color: #f8faff;
    border-top: 1px solid #e9ecef;
}

.pointer {
    cursor: pointer;
}

.feather-14 {
    width: 14px;
    height: 14px;
}

/* Memperkecil baris agar muat banyak menu tanpa scroll yang terlalu panjang */
.table td {
    padding: 0.6rem 0.75rem;
    font-size: 0.875rem;
    border-color: #f1f1f1;
}

.table thead th {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: #6c757d;
}

/* Kustomisasi Switch */
.form-check-input:checked {
    background-color: #28c76f;
    /* Hijau agar lebih jelas perubahannya */
    border-color: #28c76f;
}
</style>
