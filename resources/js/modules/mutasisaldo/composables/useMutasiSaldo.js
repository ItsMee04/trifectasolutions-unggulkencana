import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { mutasisaldoService } from '../services/mutasisaldoService';
import { saldoService } from '../../saldo/services/saldoService'

const mutasisaldo = ref([]);
const saldoList = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formMutasiSaldo = reactive({
    id: null,
    saldo: null,
    tanggal: '',
    keterangan:'',
    jenis:null,
    jumlah:''
});

const jenisList = [
    { value: 'MASUK', label: 'MASUK' },
    { value: 'KELUAR', label: 'KELUAR' }
];

export function useMutasiSaldo() {

    const fetchMutasiSaldo = async () => {
        isLoading.value = true;
        try {
            const response = await mutasisaldoService.getMutasiSaldo();
            mutasisaldo.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            mutasisaldo.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const fetchSaldo = async () => {
            try {
                const response = await saldoService.getSaldo();
                // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
                saldoList.value = response.data.map(saldoList => ({
                    value: saldoList.id,
                    label: saldoList.rekening // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
                }));
            } catch (error) {
                console.error("Gagal memuat Saldo:", error);
            }
        };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        if (!formMutasiSaldo.saldo || formMutasiSaldo.saldo === null) {
            errors.value.saldo = 'Rekening wajib dipilih.';
        } else if (Array.isArray(formMutasiSaldo.saldo) && formMutasiSaldo.saldo.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.saldo = 'Pilih satu rekening.';
        }

        // 2. Validasi Tanggal (Wajib diisi)
        if (!formMutasiSaldo.tanggal) {
            errors.value.tanggal = 'Tanggal harus dipilih.';
        }

        if (!formMutasiSaldo.jenis || formMutasiSaldo.jenis === null) {
            errors.value.jenis = 'Rekening wajib dipilih.';
        } else if (Array.isArray(formMutasiSaldo.jenis) && formMutasiSaldo.jenis.length === 0) {
            // Jika multiselect bisa memilih lebih dari satu (multiple), cek panjang array-nya
            errors.value.jenis = 'Pilih satu jenis.';
        }

        // Validasi jenis karat
        if (!formMutasiSaldo.jumlah || formMutasiSaldo.jumlah === '') {
            errors.value.jumlah = 'Jumlah tidak boleh kosong.';
        } else if (isNaN(formMutasiSaldo.jumlah)) {
            errors.value.harga = 'Jumlah harus berupa angka.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formMutasiSaldo.id = null;
        formMutasiSaldo.saldo = null;
        formMutasiSaldo.tanggal = '';
        formMutasiSaldo.keterangan = '';
        formMutasiSaldo.jenis = null;
        formMutasiSaldo.jumlah = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('mutasisaldoModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formMutasiSaldo.id = item.id;
        // 2. Set Karat terlebih dahulu
        const selectedSaldo = saldoList.value.find(s => s.value === item.saldo_id);
        if (selectedSaldo) {
            formMutasiSaldo.saldo = selectedSaldo;
        }
        formMutasiSaldo.tanggal = item.tanggal;
        formMutasiSaldo.keterangan = item.keterangan;
        const currentJenis = jenisList.find(j => j.value === item.jenis);
        formMutasiSaldo.jenis = currentJenis || null;
        formMutasiSaldo.jumlah = item.jumlah;
        const modal = new bootstrap.Modal(document.getElementById('mutasisaldoModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitMutasiSaldo = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                saldo: formMutasiSaldo.saldo.value,
                tanggal: formMutasiSaldo.tanggal,
                keterangan: formMutasiSaldo.keterangan,
                jenis: formMutasiSaldo.jenis.value,
                jumlah: formMutasiSaldo.jumlah
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formMutasiSaldo.id;
                response = await mutasisaldoService.updateMutasiSaldo(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await mutasisaldoService.storeMutasiSaldo(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('mutasisaldoModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchMutasiSaldo();

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
            text: `Data Mutasi Saldo "${item.keterangan}" yang dihapus tidak dapat dikembalikan!`,
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
                await mutasisaldoService.deleteMutasiSaldo(payload);

                toast.success('Mutasi Saldo berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchMutasiSaldo();
            } catch (error) {
                console.error('Gagal menghapus data Mutasi Saldo:', error);
                toast.error('Gagal menghapus data Mutasi Saldo.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchMutasiSaldo();
    }

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (mutasisaldo.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valRekening = String(item.saldo?.rekening ?? '').toLowerCase();
            const valTanggal = String(item.tanggal ?? '').toLowerCase();
            const valJenis = String(item.jenis ?? '').toLowerCase();
            const valJumlah = String(item.jumlah ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valRekening.includes(query) || valTanggal.includes(query) || valJenis.includes(query) || valJumlah.includes(query);
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
        mutasisaldo,
        saldoList,
        jenisList,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formMutasiSaldo,
        fetchMutasiSaldo,
        fetchSaldo,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitMutasiSaldo,
        filteredMutasiSaldo: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (mutasisaldo.value || []).filter(item =>
                String(item.saldo?.rekening ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query) ||
                String(item.keterangan ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.jumlah ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedMutasiSaldo: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (mutasisaldo.value || []).filter(item =>
                String(item.saldo?.rekening ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query) ||
                String(item.keterangan ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.jumlah ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        })
    }
}
