import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';
import { useAuthStore } from '../../../store/auth';
import { STORAGE_URL } from '../../../helper/base';

import { pegawaiService } from '../services/pegawaiService'
import { jabatanService } from '../../jabatan/services/jabatanService'

const pegawai = ref([]);
const jabatanList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});
const currentImagePreview = ref(null);

const formPegawai = reactive({
    id: null,
    nip: '',
    nama: '',
    alamat: '',
    kontak: '',
    jabatan: null,
    image: null,
});

export function usePegawai() {

    const authStore = useAuthStore();

    const fetchPegawai = async () => {
        isLoading.value = true;
        try {
            const response = await pegawaiService.getPegawai();
            pegawai.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            pegawai.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    const fetchJabatan = async () => {
        try {
            const response = await jabatanService.getJabatan();
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            jabatanList.value = response.data.map(jabatanList => ({
                value: jabatanList.id,
                label: jabatanList.jabatan // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Jabatan:", error);
        }
    };

    const validateForm = () => {
        errors.value = {};
        if (!formPegawai.nip || formPegawai.nip.trim() === '') {
            errors.value.nip = 'NIP tidak boleh kosong.';
        }
        if (!formPegawai.nama || formPegawai.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }
        return Object.keys(errors.value).length === 0;
    };

    // Helper untuk reset form agar DRY (Don't Repeat Yourself)
    const resetForm = () => {
        formPegawai.id = null;
        formPegawai.nip = '';
        formPegawai.nama = '';
        formPegawai.alamat = '';
        formPegawai.kontak = '';
        formPegawai.jabatan_id = null;
        formPegawai.jabatan = null; // Penting untuk Multiselect
        formPegawai.image = null;
        currentImagePreview.value = null; // Reset preview
        errors.value = {};
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Mengambil file asli dari input
        if (file) {
            // 1. Simpan file asli ke dalam form (ini yang akan dikirim ke DB)
            formPegawai.image = file;

            // 2. Buat URL sementara untuk pratinjau (Preview)
            if (currentImagePreview.value && currentImagePreview.value.startsWith('blob:')) {
                URL.revokeObjectURL(currentImagePreview.value);
            }
            currentImagePreview.value = URL.createObjectURL(file);

            console.log("File baru dipilih:", file.name);
        }
    };

    const handleCreate = () => {
        isEdit.value = false;
        resetForm();
        const modal = new bootstrap.Modal(document.getElementById('pegawaiModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        resetForm(); // Bersihkan sisa form sebelumnya

        // Isi data teks
        formPegawai.id = item.id;
        formPegawai.nip = item.nip;
        formPegawai.nama = item.nama;
        formPegawai.alamat = item.alamat;
        formPegawai.kontak = item.kontak;

        // Logic Preview Gambar
        if (item.image && item.image !== 'null' && item.image !== '') {
            // Simpan nama file ke state form (opsional)
            formPegawai.image = item.image;

            // Buat URL lengkap untuk preview
            const timestamp = new Date().getTime();
            currentImagePreview.value = `${STORAGE_URL}/images/pegawai/${item.image}?t=${timestamp}`;

            console.log("Preview Edit Set:", currentImagePreview.value);
        } else {
            currentImagePreview.value = null;
        }

        // Logic Jabatan
        const selectedJabatan = jabatanList.value.find(j => j.value === item.jabatan_id);
        if (selectedJabatan) {
            formPegawai.jabatan = selectedJabatan;
        }

        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('pegawaiModal'));
        modal.show();
    };

    const submitPegawai = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // Gunakan FormData untuk membungkus File
            const payload = new FormData();

            // Masukkan data teks
            payload.append('id', formPegawai.id || '');
            payload.append('nip', formPegawai.nip);
            payload.append('nama', formPegawai.nama);
            payload.append('alamat', formPegawai.alamat || '');
            payload.append('kontak', formPegawai.kontak || '');

            // Ambil ID jabatan
            const jabatanId = formPegawai.jabatan?.value || '';
            payload.append('jabatan', jabatanId);

            // LOGIKA PENTING:
            // Cek apakah formPegawai.image berisi File (hasil dari handleFileChange)
            if (formPegawai.image instanceof File) {
                payload.append('image', formPegawai.image);
            }

            let response;
            if (isEdit.value) {
                // Jika Edit, tetap gunakan POST karena FormData tidak stabil di PUT pada beberapa server
                response = await pegawaiService.updatePegawai(payload);
                if (formPegawai.id == authStore.user?.id) {

                    // Panggil updateUser dari store
                    authStore.updateUser({
                        nama: formPegawai.nama,
                        image: response.data.image // Pastikan ini berisi '0110001.jpg'
                    });
                }
            } else {
                response = await pegawaiService.storePegawai(payload);
            }

            toast.success('Data berhasil disimpan');
            await fetchPegawai();

            // Tutup modal
            const modalElement = document.getElementById('pegawaiModal');
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
            text: `Data Pegawai "${item.nama}" yang dihapus tidak dapat dikembalikan!`,
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
                await pegawaiService.deletePegawai(payload);
                toast.success('Data Pegawai berhasil dihapus.');
                fetchPegawai();
            } catch (error) {
                console.log('Gagal menghapus data Pegawai:', error);
                toast.error(error.response?.message || 'Gagal menghapus data.');
            }
        }
    };

    const handleRefresh = async () => {
        await fetchPegawai();
    }

    const totalPages = computed(() => {
        const filteredCount = pegawai.value.filter(item =>
            (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase())
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
        pegawai,
        jabatanList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        isEdit,
        errors,
        formPegawai,
        resetForm,
        fetchPegawai,
        fetchJabatan,
        totalPages,
        displayedPages,
        filteredPegawai: computed(() => {
            return pegawai.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.nip || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.kontak || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jabatan?.jabatan || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            ).slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
        }),
        paginatedPegawai: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (pegawai.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.nip || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.kontak || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                (item.jabatan?.jabatan || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        }),
        handleCreate,
        handleEdit,
        submitPegawai,
        handleDelete,
        handleRefresh,
        currentImagePreview,
        handleFileChange
    };
}
