import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { nampanService } from '../services/nampanService';
import { jenisprodukService } from '../../../modules/jenisproduk/services/jenisprodukService';

const nampan = ref([]);
const jenisprodukList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formNampan = reactive({
    id: null,
    jenisproduk: null,
    nampan: ''
});

export function useNampan() {

    const fetchNampan = async () => {
        isLoading.value = true;
        try {
            const response = await nampanService.getNampan();
            nampan.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            nampan.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const fetchJenisProduk = async () => {
        try {
            const response = await jenisprodukService.getJenisProduk();
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            jenisprodukList.value = response.data.map(jenisprodukList => ({
                value: jenisprodukList.id,
                label: jenisprodukList.jenis // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Jenis Produk:", error);
        }
    };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi nampan
        if (!formNampan.nampan || formNampan.nampan.trim() === '') {
            errors.value.nampan = 'Nampan tidak boleh kosong.';
        }

        if (!formNampan.jenisproduk || formNampan.jenisproduk === null) {
            errors.value.jenisproduk = 'Jenis Produk wajib dipilih.';
        } else if (Array.isArray(formNampan.jenisproduk) && formNampan.jenisproduk.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.jenisproduk = 'Pilih minimal satu Jenis Produk.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formNampan.id = null;
        formNampan.nampan = '';
        formNampan.jenisproduk = null;
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('nampanModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formNampan.id = item.id;
        formNampan.nampan = item.nampan;
        const selectedJenisProduk = jenisprodukList.value.find(jp => jp.value === item.jenisproduk_id);
        if (selectedJenisProduk) {
            formNampan.jenisproduk = selectedJenisProduk;
        }
        const modal = new bootstrap.Modal(document.getElementById('nampanModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitNampan = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                nampan: formNampan.nampan,
                jenisproduk: formNampan.jenisproduk.value
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formNampan.id;
                response = await nampanService.updateNampan(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await nampanService.storeNampan(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('nampanModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchNampan();

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
            text: `Data Nampan "${item.nampan}" yang dihapus tidak dapat dikembalikan!`,
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
                await nampanService.deleteNampan(payload);

                toast.success('Nampan berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchNampan();
            } catch (error) {
                console.error('Gagal menghapus data Nampan:', error);
                toast.error('Gagal menghapus data Nampan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchNampan();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (nampan.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valNampan = String(item.nampan ?? '').toLowerCase();
            const valJenisProduk = String(item.jenisproduk?.jenis ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valNampan.includes(query) || valJenisProduk.includes(query);
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
        nampan,
        jenisprodukList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formNampan,
        fetchNampan,
        fetchJenisProduk,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitNampan,
        filteredNampan: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (nampan.value || []).filter(item =>
                String(item.nampan ?? '').toLowerCase().includes(query) ||
                String(item.jenisproduk?.jenis ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedNampan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (nampan.value || []).filter(item =>
                String(item.nampan ?? '').toLowerCase().includes(query) ||
                String(item.jenisproduk?.jenis ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
