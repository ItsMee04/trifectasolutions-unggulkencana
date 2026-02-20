import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { jeniskaratService } from '../services/jeniskaratService';
import { karatService } from '../../../modules/karat/services/karatService';

const jeniskarat = ref([]);
const karatList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formJenisKarat = reactive({
    id: null,
    jenis: '',
    karat: null
});

export function useJenisKarat() {

    const fetchJenisKarat = async () => {
        isLoading.value = true;
        try {
            const response = await jeniskaratService.getJenisKarat();
            jeniskarat.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            jeniskarat.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const fetchKarat = async () => {
        try {
            const response = await karatService.getKarat();
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            karatList.value = response.data.map(karatList => ({
                value: karatList.id,
                label: karatList.karat // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Karat:", error);
        }
    };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi jenis karat
        if (!formJenisKarat.jenis || formJenisKarat.jenis.trim() === '') {
            errors.value.jenis = 'Jenis tidak boleh kosong.';
        }

        if (!formJenisKarat.karat || formJenisKarat.karat === null) {
            errors.value.karat = 'Karat wajib dipilih.';
        } else if (Array.isArray(formJenisKarat.karat) && formJenisKarat.karat.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.karat = 'Pilih minimal satu karat.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formJenisKarat.id = null;
        formJenisKarat.jenis = '';
        formJenisKarat.karat = null;
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('jeniskaratModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formJenisKarat.id = item.id;
        formJenisKarat.jenis = item.jenis;
        const selectedKarat = karatList.value.find(k => k.value === item.karat_id);
        if (selectedKarat) {
            formJenisKarat.karat = selectedKarat;
        }
        const modal = new bootstrap.Modal(document.getElementById('jeniskaratModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitJenisKarat = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                jenis: formJenisKarat.jenis,
                karat: formJenisKarat.karat.value
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formJenisKarat.id;
                response = await jeniskaratService.updateJenisKarat(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await jeniskaratService.storeJenisKarat(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('jeniskaratModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchJenisKarat();

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
            text: `Data Jenis Karat "${item.jenis}" yang dihapus tidak dapat dikembalikan!`,
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
                await jeniskaratService.deleteJenisKarat(payload);

                toast.success('Jenis Karat berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchJenisKarat();
            } catch (error) {
                console.error('Gagal menghapus data Jenis Karat:', error);
                toast.error('Gagal menghapus data Jenis Karat.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchJenisKarat();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (jeniskarat.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valJenis = String(item.jenis ?? '').toLowerCase();
            const valKarat = String(item.karat?.karat ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valJenis.includes(query) || valKarat.includes(query);
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
        jeniskarat,
        karatList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formJenisKarat,
        fetchJenisKarat,
        fetchKarat,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitJenisKarat,
        filteredJenisKarat: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (jeniskarat.value || []).filter(item =>
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.karat?.karat ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedJenisKarat: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (jeniskarat.value || []).filter(item =>
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.karat?.karat ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
