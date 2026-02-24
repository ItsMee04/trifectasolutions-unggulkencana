import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { saldoService } from '../services/saldoService';

const saldo = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formSaldo = reactive({
    id: null,
    rekening: '',
    status:null,
});

const statusList = [
    { value: 1, label: 'AKTIF' },
    { value: 0, label: 'TIDAK AKTIF' }
];

export function useSaldo() {

    const fetchSaldo = async () => {
        isLoading.value = true;
        try {
            const response = await saldoService.getSaldo();
            saldo.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            saldo.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi
        if (!formSaldo.rekening || formSaldo.rekening.trim() === '') {
            errors.value.rekening = 'Rekening tidak boleh kosong.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formSaldo.id = null;
        formSaldo.rekening = '';
        formSaldo.status = null;
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('saldoModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formSaldo.id = item.id;
        formSaldo.rekening = item.rekening;
        const currentStatus = statusList.find(s => s.value === item.status);
        formSaldo.status = currentStatus || null;
        const modal = new bootstrap.Modal(document.getElementById('saldoModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitSaldo = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                rekening: formSaldo.rekening,
                status: formSaldo.status.value
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formSaldo.id;
                response = await saldoService.updateSaldo(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await saldoService.storeSaldo(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('saldoModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchSaldo();

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
            text: `Data saldo "${item.Rekening}" yang dihapus tidak dapat dikembalikan!`,
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
                await saldoService.deleteSaldo(payload);

                toast.success('Saldo berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchSaldo();
            } catch (error) {
                console.error('Gagal menghapus data Saldo:', error);
                toast.error('Gagal menghapus data Saldo.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchSaldo();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (saldo.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valRekening = String(item.rekening ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valRekening.includes(query);
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
        saldo,
        statusList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formSaldo,
        fetchSaldo,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitSaldo,
        filteredSaldo: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (saldo.value || []).filter(item =>
                String(item.rekening ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedSaldo: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (saldo.value || []).filter(item =>
                String(item.rekening ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
