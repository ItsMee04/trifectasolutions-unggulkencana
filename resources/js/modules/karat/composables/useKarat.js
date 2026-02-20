import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { karatService } from '../services/karatService';

const karat = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formKarat = reactive({
    id: null,
    karat: ''
});

export function useKarat() {

    const fetchKarat = async () => {
        isLoading.value = true;
        try {
            const response = await karatService.getKarat();
            karat.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            karat.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi Karat
        if (!formKarat.karat || String(formKarat.karat).trim() === '') {
            errors.value.karat = 'Karat tidak boleh kosong.';
        } else if (isNaN(formKarat.karat)) {
            errors.value.karat = 'Karat harus berupa angka.';
        } else if (Number(formKarat.karat) <= 0) {
            // Opsional: Validasi jika angka tidak boleh nol atau negatif
            errors.value.karat = 'Karat harus lebih besar dari 0.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formKarat.id = null;
        formKarat.karat = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('karatModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formKarat.id = item.id;
        formKarat.karat = item.karat;
        const modal = new bootstrap.Modal(document.getElementById('karatModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitKarat = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                karat: formKarat.karat
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formKarat.id;
                response = await karatService.updateKarat(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await karatService.storeKarat(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('karatModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchKarat();

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

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Karat "${item.karat}" yang dihapus tidak dapat dikembalikan!`,
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
                await karatService.deleteKarat(payload);

                toast.success('Karat berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchKarat();
            } catch (error) {
                console.error('Gagal menghapus data Karat:', error);
                toast.error('Gagal menghapus data Karat.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchKarat();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (karat.value || []).filter(item => {
            // Konversi item.karat ke string sebelum toLowerCase
            const val = String(item.karat ?? '').toLowerCase();
            return val.includes(query);
        }).length;

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
        karat,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formKarat,
        fetchKarat,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitKarat,
        filteredKarat: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (karat.value || []).filter(item =>
                String(item.karat ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedKarat: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (karat.value || []).filter(item =>
                String(item.karat ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
