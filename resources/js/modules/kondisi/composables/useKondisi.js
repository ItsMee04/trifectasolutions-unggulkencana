import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { kondisiService } from '../services/kondisiService';

const kondisi = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formKondisi = reactive({
    id: null,
    kondisi: ''
});

export function useKondisi() {

    const fetchKondisi = async () => {
        isLoading.value = true;
        try {
            const response = await kondisiService.getKondisi();
            kondisi.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            kondisi.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error
        if (!formKondisi.kondisi || formKondisi.kondisi.trim() === '') {
            errors.value.kondisi = 'Kondisi tidak boleh kosong.';
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formKondisi.id = null;
        formKondisi.kondisi = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('kondisiModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formKondisi.id = item.id;
        formKondisi.kondisi = item.kondisi;
        const modal = new bootstrap.Modal(document.getElementById('kondisiModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitKondisi = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                kondisi: formKondisi.kondisi
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = fetchKondisi.id;
                response = await kondisiService.updateKondisi(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await kondisiService.storeKondisi(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('kondisiModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchKondisi();

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
            text: `Data Kondisi "${item.kondisi}" yang dihapus tidak dapat dikembalikan!`,
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
                await kondisiService.deleteKondisi(payload);

                toast.success('Kondisi berhasil dihapus.');

                // Memanggil fetchKondisi agar tabel terupdate otomatis tanpa reload
                await fetchKondisi();
            } catch (error) {
                console.error('Gagal menghapus data Kondisi:', error);
                toast.error('Gagal menghapus data Kondisi.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchKondisi();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = kondisi.value.filter(item =>
            (item.kondisi || '').toLowerCase().includes(query)
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
        kondisi,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formKondisi,
        fetchKondisi,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitKondisi,
        filteredKondisi: computed(() => {
            const query = searchQuery.value.toLowerCase();
            return kondisi.value.filter(item => (item.kondisi || '').toLowerCase().includes(query));
        }),
        paginatedKondisi: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (kondisi.value.filter(item => (item.kondisi || '').toLowerCase().includes(searchQuery.value.toLowerCase())))
                .slice(start, start + itemsPerPage);
        })
    }
}
