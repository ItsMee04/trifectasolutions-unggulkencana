import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pesanService } from '../services/pesanService';

const pesan = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formPesan = reactive({
    id: null,
    judul: '',
    pesan: '',
});

export function usePesan() {

    const fetchPesan = async () => {
        isLoading.value = true;
        try {
            const response = await pesanService.getPesan();
            pesan.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            pesan.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi
        if (!formPesan.judul || formPesan.judul.trim() === '') {
            errors.value.judul = 'Judul tidak boleh kosong.';
        }

        if (!formPesan.pesan || formPesan.pesan.trim() === '') {
            errors.value.pesan = 'Judul tidak boleh kosong.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formPesan.id = null;
        formPesan.judul = '';
        formPesan.pesan = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('pesanModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formPesan.id = item.id;
        formPesan.judul = item.judul;
        formPesan.pesan = item.pesan;
        const modal = new bootstrap.Modal(document.getElementById('pesanModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitPesan = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                judul: formPesan.judul,
                pesan: formPesan.pesan,
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formPesan.id;
                response = await pesanService.updatePesan(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await pesanService.storePesan(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('pesanModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchPesan();

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
            text: `Data Pesan "${item.judul}" yang dihapus tidak dapat dikembalikan!`,
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
                await pesanService.deletePesan(payload);

                toast.success('Pesan berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchPesan();
            } catch (error) {
                console.error('Gagal menghapus data Pesan:', error);
                toast.error('Gagal menghapus data Pesan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchPesan();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (pesan.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valJudul = String(item.judul ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valJudul.includes(query);
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
        pesan,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formPesan,
        fetchPesan,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitPesan,
        filteredPesan: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (pesan.value || []).filter(item =>
                String(item.judul ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedPesan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (pesan.value || []).filter(item =>
                String(item.judul ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
