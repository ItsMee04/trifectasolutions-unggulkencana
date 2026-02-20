import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { hargaService } from '../services/hargaService';
import { karatService } from '../../../modules/karat/services/karatService';
import { jeniskaratService } from '../../../modules/jeniskarat/services/jeniskaratService'

const harga = ref([]);
const karatList = ref([]);
const jeniskaratList = ref([]);
const allJenisKarat = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formHarga = reactive({
    id: null,
    harga: '',
    karat: null,
    jenis: null,
});

export function useHarga() {

    const fetchHarga = async () => {
        isLoading.value = true;
        try {
            const response = await hargaService.getHarga();
            harga.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            harga.value = [];
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

    const fetchJenisKarat = async () => {
        try {
            const response = await jeniskaratService.getJenisKarat();
            // Simpan data mentah dari API (asumsi ada field karat_id di tiap jenis)
            allJenisKarat.value = response.data;
        } catch (error) {
            console.error("Gagal memuat Jenis Karat:", error);
        }
    };

    // LOGIKA FILTER BERTINGKAT
    const filteredJenisKaratList = computed(() => {
        // Jika karat belum dipilih, jangan tampilkan jenis apa pun
        if (!formHarga.karat || !formHarga.karat.value) {
            return [];
        }

        // Filter allJenisKarat berdasarkan karat_id yang dipilih
        return allJenisKarat.value
            .filter(item => item.karat_id === formHarga.karat.value)
            .map(item => ({
                value: item.id,
                label: item.jenis
            }));
    });

    // Reset Jenis Karat jika Karat diubah
    const handleKaratChange = () => {
        formHarga.jenis = null;
    };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi jenis karat
        if (!formHarga.harga || formHarga.harga === '') {
            errors.value.harga = 'Jenis tidak boleh kosong.';
        } else if (isNaN(formHarga.harga)) {
            errors.value.harga = 'Harga harus berupa angka.';
        }

        if (!formHarga.karat || formHarga.karat === null) {
            errors.value.karat = 'Karat wajib dipilih.';
        } else if (Array.isArray(formHarga.karat) && formHarga.karat.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.karat = 'Pilih satu karat.';
        }

        if (!formHarga.jenis || formHarga.jenis === null) {
            errors.value.jenis = 'Karat wajib dipilih.';
        } else if (Array.isArray(formHarga.jenis) && formHarga.jenis.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.jenis = 'Pilih satu jenis.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formHarga.id = null;
        formHarga.karat = null;
        formHarga.jenis = null;
        formHarga.harga = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('hargaModal'));
        modal.show();
    };

    const handleEdit = async (item) => {
        isEdit.value = true;
        errors.value = {};

        // 1. Set ID dan Harga
        formHarga.id = item.id;
        formHarga.harga = item.harga;

        // 2. Set Karat terlebih dahulu
        const selectedKarat = karatList.value.find(k => k.value === item.karat_id);
        if (selectedKarat) {
            formHarga.karat = selectedKarat;
        }

        // 3. Gunakan data mentah (allJenisKarat) untuk mengisi Jenis Karat
        // Kita tidak menunggu computed jeniskaratList karena kita bisa membuat objeknya sendiri
        const selectedJenis = allJenisKarat.value.find(j => j.id === item.jeniskarat_id);

        if (selectedJenis) {
            // Pastikan properti yang diisi adalah formHarga.jenis (BUKAN formHarga.karat)
            formHarga.jenis = {
                value: selectedJenis.id,
                label: selectedJenis.jenis
            };
        }

        // 4. Tampilkan Modal
        const modalElement = document.getElementById('hargaModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitHarga = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                harga: formHarga.harga,
                karat: formHarga.karat.value,
                jenis: formHarga.jenis.value,
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formHarga.id;
                response = await hargaService.updateHarga(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await hargaService.storeHarga(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('hargaModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchHarga();

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
            text: `Data Harga "${item.harga}" yang dihapus tidak dapat dikembalikan!`,
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
                await hargaService.deleteHarga(payload);

                toast.success('Harga berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchHarga();
            } catch (error) {
                console.error('Gagal menghapus data Harga:', error);
                toast.error('Gagal menghapus data Harga.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchHarga();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (harga.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valHarga = String(item.harga ?? '').toLowerCase();
            const valKarat = String(item.karat?.karat ?? '').toLowerCase();
            const valJenisKarat = String(item.jeniskarat?.jenis ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valHarga.includes(query) || valKarat.includes(query) || valJenisKarat.includes(query);
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
        harga,
        karatList,
        jeniskaratList: filteredJenisKaratList, // Gunakan hasil filter
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formHarga,
        fetchHarga,
        fetchKarat,
        allJenisKarat,
        fetchJenisKarat,
        handleKaratChange,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitHarga,
        filteredHarga: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (harga.value || []).filter(item =>
                String(item.harga ?? '').toLowerCase().includes(query) ||
                String(item.karat?.karat ?? '').toLowerCase().includes(query) ||
                String(item.jeniskarat?.jenis ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedHarga: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (harga.value || []).filter(item =>
                String(item.harga ?? '').toLowerCase().includes(query) ||
                String(item.karat?.karat ?? '').toLowerCase().includes(query) ||
                String(item.jeniskarat?.jenis ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
