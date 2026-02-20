import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';

import { jabatanService } from '../services/jabatanService'

const jabatan = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formJabatan = reactive({
    id: null,
    jabatan: '',
});

export function useJabatan() {

    const fetchJabatan = async () => {
        isLoading.value = true;
        try {
            const response = await jabatanService.getJabatan();
            jabatan.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            jabatan.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error
        if (!formJabatan.jabatan || formJabatan.jabatan.trim() === '') {
            errors.value.jabatan = 'Nama Jabatan tidak boleh kosong.';
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formJabatan.id = null;
        formJabatan.jabatan = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('jabatanModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitJabatan = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                jabatan: formJabatan.jabatan
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formJabatan.id;
                response = await jabatanService.updateJabatan(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await jabatanService.storeJabatan(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('jabatanModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchJabatan();

            return true;
        } catch (error) {
            if (error.response?.status === 422) {
                // 1. Simpan error untuk ditampilkan di bawah input field
                errors.value = error.response.data.errors;

                // 2. ✨ TAMBAHKAN INI: Munculkan notify agar user tahu ada yang salah
                const firstErrorMessage = error.response.data.message || 'Terjadi kesalahan validasi.';
                toast.error(firstErrorMessage);
            } else {
                // Untuk error server (500), koneksi, dsb.
                toast.error(error.response?.message || 'Gagal menyimpan data.');
            }
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formJabatan.id = item.id;
        formJabatan.jabatan = item.jabatan;
        const modal = new bootstrap.Modal(document.getElementById('jabatanModal'));
        modal.show();
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Jabatan "${item.jabatan}" yang dihapus tidak dapat dikembalikan!`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Opsional: menukar posisi tombol Batal & Hapus
        });

        if (result.isConfirmed) {
            isLoading.value = true; // Set loading agar UI tetap konsisten [cite: 2025-10-25]
            try {
                // 📦 Siapkan Payload
                const payload = {
                    id: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await jabatanService.deleteJabatan(payload);

                toast.success('Jabatan berhasil dihapus.');

                // Memanggil fetchJabatan agar tabel terupdate otomatis tanpa reload
                await fetchJabatan();
            } catch (error) {
                console.error('Gagal menghapus data Jabatan:', error);
                toast.error('Gagal menghapus data Jabatan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchJabatan();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = jabatan.value.filter(item =>
            (item.jabatan || '').toLowerCase().includes(query)
        ).length;

        return Math.ceil(filteredCount / itemsPerPage) || 1;
    });

    const displayedPages = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const maxVisible = 5; // Jumlah nomor yang ingin ditampilkan

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;

        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    });

    return {
        jabatan,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        isEdit,
        errors,
        formJabatan,
        fetchJabatan,
        handleCreate,
        submitJabatan,
        handleEdit,
        handleDelete,
        handleRefresh,
        totalPages,
        displayedPages,
        filteredJabatan: computed(() => {
            const query = searchQuery.value.toLowerCase();
            return jabatan.value.filter(item => (item.jabatan || '').toLowerCase().includes(query));
        }),
        paginatedJabatan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (jabatan.value.filter(item => (item.jabatan || '').toLowerCase().includes(searchQuery.value.toLowerCase())))
                .slice(start, start + itemsPerPage);
        }),
    }
}
