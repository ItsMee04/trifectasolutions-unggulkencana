import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { diskonService } from '../services/diskonService';

const diskon = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formDiskon = reactive({
    id: null,
    diskon: '',
    nilai: ''
});

export function useDiskon() {

    const fetchDiskon = async () => {
        isLoading.value = true;
        try {
            const response = await diskonService.getDiskon();
            diskon.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            diskon.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error
        if (!formDiskon.diskon || formDiskon.diskon.trim() === '') {
            errors.value.diskon = 'Diskon tidak boleh kosong.';
        }
        if (!formDiskon.nilai || formDiskon.nilai === '') {
            errors.value.nilai = 'Nilai tidak boleh kosong.';
        } else if (isNaN(formDiskon.nilai)) {
            errors.value.nilai = 'Nilai harus berupa angka.';
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formDiskon.id = null;
        formDiskon.diskon = '';
        formDiskon.nilai = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('diskonModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formDiskon.id = item.id;
        formDiskon.diskon = item.diskon;
        formDiskon.nilai = item.nilai;
        const modal = new bootstrap.Modal(document.getElementById('diskonModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitDiskon = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                diskon: formDiskon.diskon,
                nilai: formDiskon.nilai
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formDiskon.id;
                response = await diskonService.updateDiskon(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await diskonService.storeDiskon(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('diskonModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchDiskon();

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
            text: `Data Diskon "${item.diskon}" yang dihapus tidak dapat dikembalikan!`,
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
                await diskonService.deleteDiskon(payload);

                toast.success('Diskon berhasil dihapus.');

                // Memanggil fetchDiskon agar tabel terupdate otomatis tanpa reload
                await fetchDiskon();
            } catch (error) {
                console.error('Gagal menghapus data Diskon:', error);
                toast.error('Gagal menghapus data Diskon.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchDiskon();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = diskon.value.filter(item =>
            (item.diskon || '').toLowerCase().includes(query) ||
            (item.nilai || '').toLowerCase().includes(query)
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
        diskon,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formDiskon,
        fetchDiskon,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitDiskon,
        filteredDiskon: computed(() => {
            const query = searchQuery.value.toLowerCase();
            return diskon.value.filter(item =>
                (item.diskon || '').toLowerCase().includes(query) ||
                (item.nilai || '').toLowerCase().includes(query)
            );
        }),
        paginatedDiskon: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (diskon.value.filter(item =>
                (item.diskon || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.nilai || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        })
    }
}
