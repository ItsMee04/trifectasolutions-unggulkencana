import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { suplierService } from '../services/suplierService';

const suplier = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formSuplier = reactive({
    id: null,
    nama: '',
    kontak: '',
    alamat: '',
});

export function useSuplier() {

    const fetchSuplier = async () => {
        isLoading.value = true;
        try {
            const response = await suplierService.getSuplier();
            suplier.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            suplier.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi
        if (!formSuplier.nama || formSuplier.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }

        // 3. Validasi Kontak (Boleh kosong, tapi jika diisi harus angka)
        if (formSuplier.kontak) {
            // Menggunakan regex untuk memastikan hanya angka
            const isNumeric = /^\d+$/.test(formSuplier.kontak);
            if (!isNumeric) {
                errors.value.kontak = 'Kontak harus berupa angka.';
            }
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formSuplier.id = null;
        formSuplier.nama = '';
        formSuplier.kontak = '';
        formSuplier.alamat = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('suplierModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formSuplier.id = item.id;
        formSuplier.nama = item.nama;
        formSuplier.kontak = item.kontak;
        formSuplier.alamat = item.alamat;
        const modal = new bootstrap.Modal(document.getElementById('suplierModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitSuplier = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                nama: formSuplier.nama,
                kontak: formSuplier.kontak,
                alamat: formSuplier.alamat,
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formSuplier.id;
                response = await suplierService.updateSuplier(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await suplierService.storeSuplier(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('suplierModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchSuplier();

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
            text: `Data Suplier "${item.nama}" yang dihapus tidak dapat dikembalikan!`,
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
                await suplierService.deleteSuplier(payload);

                toast.success('Suplier berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchPelanggan();
            } catch (error) {
                console.error('Gagal menghapus data Suplier:', error);
                toast.error('Gagal menghapus data Suplier.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchSuplier();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (suplier.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valNama = String(item.nama ?? '').toLowerCase();
            const valKontak = String(item.kontak ?? '').toLowerCase();
            const valAlamat = String(item.alamat ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valNama.includes(query) || valKontak.includes(query) || valAlamat.includes(query);
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
        suplier,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formSuplier,
        fetchSuplier,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitSuplier,
        filteredSuplier: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (suplier.value || []).filter(item =>
                String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kontak ?? '').toLowerCase().includes(query) ||
                String(item.alamat ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedSuplier: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (suplier.value || []).filter(item =>
                String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kontak ?? '').toLowerCase().includes(query) ||
                String(item.alamat ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
