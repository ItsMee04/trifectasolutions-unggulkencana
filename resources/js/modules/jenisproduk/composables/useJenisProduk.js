import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';
import { STORAGE_URL } from '../../../helper/base';

import { jenisprodukService } from '../services/jenisprodukService'

const jenisproduk = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});
const currentImagePreview = ref(null);

const formJenisProduk = reactive({
    id: null,
    jenis: '',
    image: null,
});

export function useJenisProduk() {

    const fetchJenisProduk = async () => {
        isLoading.value = true;
        try {
            const response = await jenisprodukService.getJenisProduk();
            jenisproduk.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            jenisproduk.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    const validateForm = () => {
        errors.value = {};
        if (!formJenisProduk.jenis || formJenisProduk.jenis.trim() === '') {
            errors.value.jenis = 'Jenis tidak boleh kosong.';
        }
        return Object.keys(errors.value).length === 0;
    };

    // Helper untuk reset form agar DRY (Don't Repeat Yourself)
    const resetForm = () => {
        formJenisProduk.id = null;
        formJenisProduk.jenis = '';
        formJenisProduk.image = null;
        currentImagePreview.value = null; // Reset preview
        errors.value = {};
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Mengambil file asli dari input
        if (file) {
            // 1. Simpan file asli ke dalam form (ini yang akan dikirim ke DB)
            formJenisProduk.image = file;

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
        const modal = new bootstrap.Modal(document.getElementById('jenisprodukModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        resetForm(); // Bersihkan sisa form sebelumnya

        // Isi data teks
        formJenisProduk.id = item.id;
        formJenisProduk.jenis = item.jenis;
        // Logic Preview Gambar
        if (item.image && item.image !== 'null' && item.image !== '') {
            // Simpan nama file ke state form (opsional)
            formJenisProduk.image = item.image;

            // Buat URL lengkap untuk preview
            const timestamp = new Date().getTime();
            currentImagePreview.value = `${STORAGE_URL}/images/jenisproduk/${item.image}?t=${timestamp}`;
        } else {
            currentImagePreview.value = null;
        }

        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('jenisprodukModal'));
        modal.show();
    };

    const submitJenisProduk = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // Gunakan FormData untuk membungkus File
            const payload = new FormData();

            // Masukkan data teks
            payload.append('id', formJenisProduk.id || '');
            payload.append('jenis', formJenisProduk.jenis);

            // LOGIKA PENTING:
            // Cek apakah formJenisProduk.image berisi File (hasil dari handleFileChange)
            if (formJenisProduk.image instanceof File) {
                payload.append('image', formJenisProduk.image);
            }

            let response;
            if (isEdit.value) {
                // Jika Edit, tetap gunakan POST karena FormData tidak stabil di PUT pada beberapa server
                response = await jenisprodukService.updateJenisProduk(payload);
            } else {
                response = await jenisprodukService.storeJenisProduk(payload);
            }

            toast.success('Data berhasil disimpan');
            await fetchJenisProduk();

            // Tutup modal
            const modalElement = document.getElementById('jenisprodukModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

        } catch (error) {
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
            text: `Data Jenis Produk "${item.jenis}" yang dihapus tidak dapat dikembalikan!`,
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
                await jenisprodukService.deleteJenisProduk(payload);
                toast.success('Data Jenis Produk berhasil dihapus.');
                fetchJenisProduk();
            } catch (error) {
                toast.error(error.response?.message || 'Gagal menghapus data.');
            }
        }
    };

    const handleRefresh = async () => {
        await fetchJenisProduk();
    }

    const totalPages = computed(() => {
        const filteredCount = jenisproduk.value.filter(item =>
            (item.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase())
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
        jenisproduk,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        isEdit,
        errors,
        formJenisProduk,
        resetForm,
        fetchJenisProduk,
        totalPages,
        displayedPages,
        filteredJenisProduk: computed(() => {
            return jenisproduk.value.filter(item =>
                (item.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            ).slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
        }),
        paginatedJenisProduk: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (jenisproduk.value.filter(item =>
                (item.jenis || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        }),
        handleCreate,
        handleEdit,
        submitJenisProduk,
        handleDelete,
        handleRefresh,
        currentImagePreview,
        handleFileChange
    };
}
