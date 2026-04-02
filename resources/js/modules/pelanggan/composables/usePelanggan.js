import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pelangganService } from '../services/pelangganService';
import { pesanService } from '../../pesan/services/pesanService';

const pelanggan = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

const formPelanggan = reactive({
    id: null,
    nama: '',
    kontak: '',
    alamat: '',
    tanggal: '',
    judul: null,
    pesan: ''
});

const pesanList = ref([]);
const rawPesanData = ref([]);

export function usePelanggan() {

    const fetchPelanggan = async () => {
        isLoading.value = true;
        try {
            const response = await pelangganService.getPelanggan();
            pelanggan.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            pelanggan.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi
        if (!formPelanggan.nama || formPelanggan.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }

        // 2. Validasi Tanggal (Wajib diisi)
        if (!formPelanggan.tanggal) {
            errors.value.tanggal = 'Tanggal harus dipilih.';
        }

        // 3. Validasi Kontak (Boleh kosong, tapi jika diisi harus angka)
        if (formPelanggan.kontak) {
            // Menggunakan regex untuk memastikan hanya angka
            const isNumeric = /^\d+$/.test(formPelanggan.kontak);
            if (!isNumeric) {
                errors.value.kontak = 'Kontak harus berupa angka.';
            }
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = () => {
        isEdit.value = false;
        formPelanggan.id = null;
        formPelanggan.nama = '';
        formPelanggan.kontak = null;
        formPelanggan.alamat = '';
        formPelanggan.tanggal = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('pelangganModal'));
        modal.show();
    };

    const handleEdit = (item) => {
        isEdit.value = true;
        errors.value = {};
        formPelanggan.id = item.id;
        formPelanggan.nama = item.nama;
        formPelanggan.kontak = item.kontak;
        formPelanggan.alamat = item.alamat;
        formPelanggan.tanggal = item.tanggal;
        const modal = new bootstrap.Modal(document.getElementById('pelangganModal'));
        modal.show();
    };

    // --- LOGIKA SUBMIT (STORE & UPDATE) ---
    const submitPelanggan = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                nama: formPelanggan.nama,
                kontak: formPelanggan.kontak,
                alamat: formPelanggan.alamat,
                tanggal: formPelanggan.tanggal,
            };

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formPelanggan.id;
                response = await pelangganService.updatePelanggan(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await pelangganService.storePelanggan(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('pelangganModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchPelanggan();

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
            text: `Data Pelanggan "${item.nama}" yang dihapus tidak dapat dikembalikan!`,
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
                await pelangganService.deletePelanggan(payload);

                toast.success('Pelanggan berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchPelanggan();
            } catch (error) {
                console.error('Gagal menghapus data Pelanggan:', error);
                toast.error('Gagal menghapus data Pelanggan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchPelanggan();
    }

    const fetchPesan = async () => {
        try {
            const response = await pesanService.getPesan();
            // Simpan data asli untuk referensi pencarian isi pesan nanti
            rawPesanData.value = response.data;

            // Format untuk Multiselect
            pesanList.value = response.data.map(pesan => ({
                value: pesan.id,
                label: pesan.judul
            }));
        } catch (error) {
            console.error("Gagal memuat Pesan:", error);
        }
    };

    // Watcher untuk mengisi pesan otomatis
    watch(() => formPelanggan.judul, (newVal) => {
        if (newVal && newVal.value) {
            // 1. Cari data pesan mentah dari API
            const selectedPesan = rawPesanData.value.find(p => p.id === newVal.value);

            if (selectedPesan) {
                let teksPesan = selectedPesan.pesan;

                // 2. Logika penyisipan nama:
                // Jika di database ada kata [NAMA], kita ganti dengan formPelanggan.nama
                // Jika tidak ada placeholder, kita bisa menambahkannya di depan pesan
                if (teksPesan.includes('[NAMA]')) {
                    formPelanggan.pesan = teksPesan.replace('[NAMA]', formPelanggan.nama);
                } else {
                    // Contoh jika ingin ditaruh di paling depan: "Halo [Nama], [Isi Pesan]"
                    formPelanggan.pesan = `HALLO ${formPelanggan.nama}, ${teksPesan}`;
                }
            }
        } else {
            formPelanggan.pesan = '';
        }
    });

    const handleKirimPesanForm = (item) => {
        formPelanggan.id = item.id;
        formPelanggan.nama = item.nama;
        formPelanggan.kontak = item.kontak;
        formPelanggan.judul = null; // Reset pilihan judul
        formPelanggan.pesan = '';    // Reset isi pesan

        // formPelanggan.tanggal = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('formKirimPesanModal'));
        modal.show();
    };

    const submitKirimPesan = async () => {
        // 1. Reset & Validasi lokal
        errors.value = {};
        if (!formPelanggan.pesan || formPelanggan.pesan.trim() === '') {
            errors.value.pesan = 'Isi pesan tidak boleh kosong.';
            return false;
        }
        if (!formPelanggan.kontak) {
            errors.value.kontak = 'Nomor kontak tidak ditemukan.';
            return false;
        }

        isLoading.value = true;
        try {
            const nomor = formPelanggan.kontak;
            const pesan = formPelanggan.pesan;

            // 2. Bersihkan nomor (hanya angka)
            let nomorClean = nomor.replace(/\D/g, '');

            // Tambahan: Pastikan format 62 jika nomor diawali '0'
            if (nomorClean.startsWith('0')) {
                nomorClean = '62' + nomorClean.slice(1);
            }

            // 3. Encode pesan untuk URL
            const pesanEncoded = encodeURIComponent(pesan);

            // 4. Buat URL WhatsApp
            const waUrl = `https://wa.me/${nomorClean}?text=${pesanEncoded}`;

            // 5. Eksekusi: Buka WhatsApp & Tutup Modal
            window.open(waUrl, '_blank');

            toast.success('Mengarahkan ke WhatsApp...');

            // Tutup modal secara manual menggunakan ID modal yang sesuai
            const modalElement = document.getElementById('formKirimPesanModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Reset field pesan dan judul saja agar bersih untuk berikutnya
            formPelanggan.pesan = '';
            formPelanggan.judul = null;

            return true;
        } catch (error) {
            toast.error('Gagal memproses pengiriman pesan.');
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const totalPages = computed(() => {
        const query = String(searchQuery.value || '').toLowerCase();
        const filteredCount = (pelanggan.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valNama = String(item.nama ?? '').toLowerCase();
            const valKontak = String(item.kontak ?? '').toLowerCase();
            const valAlamat = String(item.alamat ?? '').toLowerCase();
            const valTanggal = String(item.tanggal ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valNama.includes(query) || valKontak.includes(query) || valAlamat.includes(query) || valTanggal.includes(query);
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
        pelanggan,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        formPelanggan,
        fetchPelanggan,
        handleCreate,
        handleEdit,
        handleDelete,
        handleRefresh,
        submitPelanggan,
        filteredPelanggan: computed(() => {
            const query = String(searchQuery.value || '').toLowerCase();
            return (pelanggan.value || []).filter(item =>
                String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kontak ?? '').toLowerCase().includes(query) ||
                String(item.alamat ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedPelanggan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const query = String(searchQuery.value || '').toLowerCase();

            const filtered = (pelanggan.value || []).filter(item =>
                String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kontak ?? '').toLowerCase().includes(query) ||
                String(item.alamat ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPage);
        }),
        handleKirimPesanForm,
        fetchPesan,
        pesanList,
        submitKirimPesan
    }
}
