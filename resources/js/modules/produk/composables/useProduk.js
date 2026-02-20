import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';
import { STORAGE_URL } from '../../../helper/base';

import { produkService } from '../services/produkService'
import { jenisprodukService } from '../../../modules/jenisproduk/services/jenisprodukService'
import { karatService } from '../../../modules/karat/services/karatService'
import { jeniskaratService } from '../../../modules/jeniskarat/services/jeniskaratService'
import { hargaService } from '../../../modules/harga/services/hargaService'

const produk = ref([]);
const jenisprodukList = ref([]);
const karatList = ref([]);
const jeniskaratList = ref([]);
const allJenisKarat = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});
const currentImagePreview = ref(null);

const formProduk = reactive({
    id: null,
    nama: '',
    berat: '',
    jenisproduk: null,
    karat: null,
    jeniskarat: null,
    lingkar: '',
    panjang: '',
    harga_id: null,
    harga_display: '',
    keterangan: '',
    image: null,
});

export function useProduk() {

    const fetchProduk = async () => {
        isLoading.value = true;
        try {
            const response = await produkService.getProduk();
            produk.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            produk.value = [];
        } finally {
            isLoading.value = false;
        }
    };

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

    const fetchKarat = async () => {
        try {
            const response = await karatService.getKarat();
            karatList.value = response.data.map(karatList => ({
                value: karatList.id,
                label: karatList.karat,
            }));
        } catch (error) {
            console.log("Gagal memuat Karat", error)
        }
    };

    // Tambahkan allJenisKarat dan logic fetch-nya
    const fetchJenisKarat = async () => {
        try {
            const response = await jeniskaratService.getJenisKarat();
            allJenisKarat.value = response.data;
        } catch (error) {
            console.error("Gagal memuat Jenis Karat:", error);
        }
    };

    // LOGIKA FILTER BERTINGKAT (Computed)
    const filteredJenisKaratList = computed(() => {
        if (!formProduk.karat || !formProduk.karat.value) return [];

        return allJenisKarat.value
            .filter(item => item.karat_id === formProduk.karat.value)
            .map(item => ({
                value: item.id,
                label: item.jenis
            }));
    });

    // Reset Jenis Karat jika Karat diubah
    const handleKaratChange = () => {
        formProduk.jeniskarat = null;
        formProduk.harga = null; // Reset harga juga karena kombinasi berubah
    };

    const fetchHargaOtomatis = async () => {
        if (formProduk.karat?.value && formProduk.jeniskarat?.value) {
            try {
                const response = await hargaService.getHarga();
                const dataHarga = Array.isArray(response) ? response : response.data;

                // Cari data harga yang cocok
                const found = dataHarga.find(h =>
                    h.karat_id === formProduk.karat.value &&
                    h.jeniskarat_id === formProduk.jeniskarat.value
                );

                if (found) {
                    formProduk.harga_id = found.id; // ID untuk database
                    formProduk.harga_display = found.harga; // Nominal untuk UI
                } else {
                    formProduk.harga_id = null;
                    formProduk.harga_display = 'Harga belum diatur';
                }
            } catch (error) {
                console.error("Gagal mengambil harga:", error);
            }
        }
    };

    // Gunakan watch untuk memantau perubahan pada jeniskarat
    watch(() => formProduk.jeniskarat, (newVal) => {
        if (newVal) {
            fetchHargaOtomatis();
        }
    });

    const validateForm = () => {
        errors.value = {};
        if (!formProduk.nama || formProduk.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }

        if (!formProduk.berat || String(formProduk.berat).trim() === '') {
            errors.value.berat = 'Berat tidak boleh kosong.';
        } else {
            // Regex untuk memastikan hanya angka dan titik, bukan koma
            const beratRegex = /^\d+(\.\d+)?$/;

            if (String(formProduk.berat).includes(',')) {
                errors.value.berat = 'Gunakan titik (.) sebagai pemisah desimal, bukan koma.';
            } else if (!beratRegex.test(formProduk.berat)) {
                errors.value.berat = 'Format berat tidak valid (contoh: 10.5).';
            }
        }

        if (!formProduk.karat || formProduk.karat === null) {
            errors.value.karat = 'Karat wajib dipilih.';
        } else if (Array.isArray(formProduk.karat) && formProduk.karat.length === 0) {
            errors.value.karat = 'Pilih satu karat.';
        }

        if (!formProduk.jeniskarat || formProduk.jeniskarat === null) {
            errors.value.jeniskarat = 'Jenis Karat wajib dipilih.';
        } else if (Array.isArray(formProduk.jeniskarat) && formProduk.jeniskarat.length === 0) {
            errors.value.jeniskarat = 'Pilih satu jenis karat.';
        }

        return Object.keys(errors.value).length === 0;
    };

    // Helper untuk reset form agar DRY (Don't Repeat Yourself)
    const resetForm = () => {
        formProduk.id = null;
        formProduk.nama = '';
        formProduk.berat = '';
        formProduk.jenisproduk = null;
        formProduk.karat = null;
        formProduk.jeniskarat = null;
        formProduk.harga = '';
        formProduk.lingkar = '';
        formProduk.panjang = '';
        formProduk.keterangan = '';
        formProduk.image = null;
        currentImagePreview.value = null; // Reset preview
        errors.value = {};
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Mengambil file asli dari input
        if (file) {
            // 1. Simpan file asli ke dalam form (ini yang akan dikirim ke DB)
            formProduk.image = file;

            // 2. Buat URL sementara untuk pratinjau (Preview)
            if (currentImagePreview.value && currentImagePreview.value.startsWith('blob:')) {
                URL.revokeObjectURL(currentImagePreview.value);
            }
            currentImagePreview.value = URL.createObjectURL(file);
        }
    };

    const handleCreate = () => {
        isEdit.value = false;
        resetForm();
        const modal = new bootstrap.Modal(document.getElementById('produkModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        resetForm();

        formProduk.id = item.id;
        formProduk.nama = item.nama;
        formProduk.berat = item.berat;
        formProduk.lingkar = item.lingkar;
        formProduk.panjang = item.panjang;
        formProduk.keterangan = item.keterangan;
        formProduk.harga_id = item.harga_id;
        formProduk.harga_display = item.harga?.harga || item.harga;

        // Set Dropdown Jenis Produk
        const sj = jenisprodukList.value.find(j => j.value === item.jenisproduk_id);
        if (sj) formProduk.jenisproduk = sj;

        // Set Dropdown Karat
        const sk = karatList.value.find(k => k.value === item.karat_id);
        if (sk) formProduk.karat = sk;

        // Set Dropdown Jenis Karat (Cari dari master data)
        const sjk = allJenisKarat.value.find(jk => jk.id === item.jeniskarat_id);
        if (sjk) {
            formProduk.jeniskarat = { value: sjk.id, label: sjk.jenis };
        }

        // Preview Image
        if (item.image) {
            currentImagePreview.value = `${STORAGE_URL}/images/produk/${item.image}`;
        }

        const modal = new bootstrap.Modal(document.getElementById('produkModal'));
        modal.show();
    };

    const submitProduk = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // Gunakan FormData untuk membungkus File
            const payload = new FormData();

            // Masukkan data teks
            payload.append('id', formProduk.id || '');
            payload.append('nama', formProduk.nama);
            payload.append('berat', formProduk.berat || 0.0);
            payload.append('harga', formProduk.harga_id || '');
            payload.append('lingkar', formProduk.lingkar || 0);
            payload.append('panjang', formProduk.panjang || 0);
            payload.append('keterangan', formProduk.keterangan || '');

            const jenisprodukId = formProduk.jenisproduk?.value || '';
            payload.append('jenisproduk', jenisprodukId);

            const karatId = formProduk.karat?.value || '';
            payload.append('karat', karatId);

            const jeniskaratId = formProduk.jeniskarat?.value || '';
            payload.append('jeniskarat', jeniskaratId);

            // LOGIKA PENTING:
            // Cek apakah formProduk.image berisi File (hasil dari handleFileChange)
            if (formProduk.image instanceof File) {
                payload.append('image', formProduk.image);
            }

            let response;
            if (isEdit.value) {
                // Jika Edit, tetap gunakan POST karena FormData tidak stabil di PUT pada beberapa server
                response = await produkService.updateProduk(payload);
            } else {
                response = await produkService.storeProduk(payload);
            }

            toast.success('Data berhasil disimpan');
            await fetchProduk();

            // Tutup modal
            const modalElement = document.getElementById('produkModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

        } catch (error) {
            console.error("Error saat submit:", error);
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors || {};
            } else {
                toast.error('Gagal menyimpan data ke server.');
            }
        } finally {
            isLoading.value = false;
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Produk "${item.kodeproduk}" yang dihapus tidak dapat dikembalikan!`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const payload = {
                    id: item.id,
                };
                await produkService.deleteProduk(payload);
                toast.success('Data Produk berhasil dihapus.');
                fetchPegawai();
            } catch (error) {
                console.log('Gagal menghapus data Produk:', error);
                toast.error(error.response?.message || 'Gagal menghapus data.');
            }
        }
    };

    const handleRefresh = async () => {
        await fetchProduk();
    }

    const totalPages = computed(() => {
        const filteredCount = produk.value.filter(item =>
            (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.berat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.jenisproduk?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.karat?.karat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.jeniskarat?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.lingkar || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.panjang || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (item.keterangan || '').toLowerCase().includes(searchQuery.value.toLowerCase())
        ).length;
        return Math.ceil(filteredCount / itemsPerPage) || 1;
    });

    const displayedPages = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const maxVisible = 5;

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
        produk,
        jenisprodukList,
        karatList,
        jeniskaratList: filteredJenisKaratList,
        allJenisKarat,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        isEdit,
        errors,
        formProduk,
        resetForm,
        fetchProduk,
        fetchJenisProduk,
        fetchKarat,
        fetchJenisKarat,
        handleKaratChange,
        totalPages,
        displayedPages,
        filteredProduk: computed(() => {
            return produk.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.berat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jenisproduk?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.karat?.karat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jeniskarat?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.lingkar || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.panjang || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.keterangan || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            ).slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
        }),
        paginatedProduk: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (produk.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.berat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jenisproduk?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.karat?.karat || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jeniskarat?.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.lingkar || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.panjang || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.keterangan || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        }),
        handleCreate,
        handleEdit,
        submitProduk,
        handleDelete,
        handleRefresh,
        currentImagePreview,
        handleFileChange
    };
}
