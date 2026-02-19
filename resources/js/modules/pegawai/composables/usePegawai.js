import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';

import { pegawaiService } from '../services/pegawaiService'

const pegawai = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formPegawai = reactive({
    id: null,
    nip: '',
    nama: '',
    alamat: '',
    kontak: '',
    jabatan_id: null,
    image: null,
});

export function usePegawai() {

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

    const handleCreate = () => {
        isEdit.value = false;
        formPegawai.id = null;
        formPegawai.nip = '';
        formPegawai.nama = '';
        formPegawai.alamat = '';
        formPegawai.kontak = '';
        formPegawai.jabatan_id = null;
        formPegawai.image = null;
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('pegawaiModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        formPegawai.id = item.id;
        formPegawai.nip = item.nip;
        formPegawai.nama = item.nama;
        formPegawai.alamat = item.alamat;
        formPegawai.kontak = item.kontak;
        formPegawai.jabatan_id = item.jabatan_id;
        formPegawai.image = null; // Reset image saat edit, karena tidak wajib diubah
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('pegawaiModal'));
        modal.show();
    };

    const submitPegawai = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            const payload = new FormData();
            payload.append('nip', formPegawai.nip);
            payload.append('nama', formPegawai.nama);
            payload.append('alamat', formPegawai.alamat);
            payload.append('kontak', formPegawai.kontak);
            payload.append('jabatan_id', formPegawai.jabatan_id);
            if (formPegawai.image) {
                payload.append('image', formPegawai.image);
            }

            let response;
            if (isEdit.value) {
                response = await pegawaiService.updatePegawai(formPegawai.id, payload);
                toast.success('Data Pegawai berhasil diperbarui.');
            } else {
                response = await pegawaiService.createPegawai(payload);
                toast.success('Data Pegawai berhasil ditambahkan.');
            }
            fetchPegawai();
            const modal = bootstrap.Modal.getInstance(document.getElementById('pegawaiModal'));
            modal.hide();
        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors || {};
            } else {
                console.log('Gagal menyimpan data Pegawai:', error);
                toast.error(error.response?.message || 'Gagal menyimpan data.');
            }
        } finally {
            isLoading.value = false;
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Pegawai "${item.nama}" yang dihapus tidak dapat dikembalikan!`,
            icon: 'warning',
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

        let start = Math.max(current - Math.floor(maxVisible /2),1);
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
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        isEdit,
        errors,
        formPegawai,
        fetchPegawai,
        totalPages,
        displayedPages,
        filteredPegawai: computed(() => {
            return pegawai.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            ).slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
        }),
        paginatedPegawai: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (pegawai.value.filter(item =>
                (item.nama || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        }),
        handleCreate,
        handleEdit,
        submitPegawai,
        handleDelete,
        handleRefresh,
    };
}
