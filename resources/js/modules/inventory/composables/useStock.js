import { ref, computed, reactive, watch } from "vue";
import toast from '../../../helper/toast';
import Swal from "sweetalert2";

import { stockService } from "../services/stockService";

const PeriodeStok = ref([]);
const selectedPeriodeStokID = ref(null);
const isLoadingPeriodeStok = ref(false);
const searchPeriodeStok = ref('');
const currentPagePeriodeStok = ref(1);
const itemsPerPagePeriodeStok = 5;

const nampanproduk = ref([]);
const isLoadingNampanProduk = ref(false);
const searchNampanProduk = ref('');
const currentPageNampanProduk = ref(1);
const itemsPerPageNampanProduk = 10;

const rekapstok = ref([]);

const formPeriode = reactive({
    periode: ''
});

const errors = ref({});

const fetchNampanProduk = async () => {
    if (!selectedPeriodeStokID.value) return;

    isLoadingNampanProduk.value = true;
    try {
        const payload = {
            periode: selectedPeriodeStokID.value
        }
        // Memanggil service berdasarkan ID nampan yang aktif
        const response = await stockService.getNampanProdukByPeriodeStok(payload);
        nampanproduk.value = Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        nampanproduk.value = [];
    } finally {
        // Memberikan jeda sedikit agar transisi "Memuat data..." terlihat halus
        isLoadingNampanProduk.value = false;
    }
}

const fetchRekapStok = async () => {
    if (!selectedPeriodeStokID.value) return;

    isLoadingNampanProduk.value = true;
    try {
        const payload = {
            periode: selectedPeriodeStokID.value
        }
        const response = await stockService.getRekapStokByPeriode(payload);

        // PERBAIKAN DI SINI:
        // Cek apakah response memiliki properti 'rekap' (sesuai JSON yang Anda kirim)
        if (response && response.rekap) {
            rekapstok.value = response.rekap;
        }
        // Jika response dibungkus data oleh axios: response.data.rekap
        else if (response.data && response.data.rekap) {
            rekapstok.value = response.data.rekap;
        }
        // Fallback jika response langsung berupa array
        else {
            rekapstok.value = Array.isArray(response) ? response : [];
        }
    } catch (error) {
        rekapstok.value = [];
    } finally {
        // Memberikan jeda sedikit agar transisi "Memuat data..." terlihat halus
        isLoadingNampanProduk.value = false;
    }
}

watch(selectedPeriodeStokID, (newId) => {
    if (newId) {
        currentPageNampanProduk.value = 1; // Reset halaman PRODUK saja ke 1
        fetchNampanProduk();
        fetchRekapStok();
    }
})

export function useStock() {

    const fetchPeriodeStok = async () => {
        isLoadingPeriodeStok.value = true;
        try {
            const response = await stockService.getPeriodeStok();
            PeriodeStok.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            PeriodeStok.value = [];
        } finally {
            isLoadingPeriodeStok.value = false;
        }
    }

    const validateForm = () => {
        errors.value = {}; // Reset error
        if (!formPeriode.periode || formPeriode.periode.trim() === '') {
            toast.error("Tanggal tidak boleh kosong.")
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleCreatePeriode = async () => {
        if (!validateForm()) return false;

        isLoadingPeriodeStok.value = true;

        try {
            const payload = {
                periode: formPeriode.periode
            }

            const response = await stockService.storePeriodeStok(payload);
            toast.success(response.message || 'Data berhasil disimpan');

            await fetchPeriodeStok();
        } catch (error) {
            if (error.response?.status === 422) {
                // 1. Simpan error untuk ditampilkan di bawah input field
                errors.value = error.response.data.errors;

                // 2. ✨ TAMBAHKAN INI: Munculkan notify agar user tahu ada yang salah
                const firstErrorMessage = error.response.data.message || 'Terjadi kesalahan validasi.';
                toast.error(firstErrorMessage);
            } else {
                console.log(error)
                // Untuk error server (500), koneksi, dsb.
                toast.error(error.response?.message || 'Gagal menyimpan data.');
            }
            return false;
        } finally {
            isLoadingPeriodeStok.value = false;
        }
    }

    const selectPeriodeStok = (id) => {
        selectedPeriodeStokID.value = id;
    };

    const selectedPeriodeStokData = computed(() => {
        return PeriodeStok.value.find(item => item.id === selectedPeriodeStokID.value) || {};
        // Mengembalikan {} (objek kosong) jika tidak ketemu, bukan null
    });

    const handlePilihPeriodeStok = (item) => {
        // 1. Jalankan fungsi untuk mengubah state
        selectPeriodeStok(item.id);
    }

    const handleRefresh = async () => {
        await fetchPeriodeStok();
    }

    const handleFinalisasiPeriode = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Periode "${item.kode}" akan di final ?`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, final!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Opsional: menukar posisi tombol Batal & Hapus
        });

        if (result.isConfirmed) {
            isLoadingPeriodeStok.value = true; // Set loading agar UI tetap konsisten [cite: 2025-10-25]
            try {
                // 📦 Siapkan Payload
                const payload = {
                    id: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await stockService.finalPeriodeStok(payload);

                toast.success('Periode Stok berhasil difinal.');

                // Memanggil fetchDiskon agar tabel terupdate otomatis tanpa reload
                await fetchPeriodeStok();
            } catch (error) {
                console.error('Gagal memfinal periode stok:', error);
                toast.error('Gagal memfinal periode stok.');
            } finally {
                isLoadingPeriodeStok.value = false;
            }
        }
    }

    const totalPagesPeriodeStok = computed(() => {
        const query = String(searchPeriodeStok.value || '').toLowerCase();
        const filteredCount = (PeriodeStok.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valKode = String(item.kode ?? '').toLowerCase();
            const valPeriode = String(item.periode ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valKode.includes(query) || valPeriode.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePeriodeStok) || 1;
    });

    const displayedPagesPeriodeStok = computed(() => {
        const total = totalPagesPeriodeStok.value;
        const current = currentPagePeriodeStok.value;
        const maxVisible = 3; // Jumlah nomor yang ingin ditampilkan

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

    const totalPagesNampanProduk = computed(() => {
        const query = String(searchNampanProduk.value || '').toLowerCase();
        const filteredCount = (nampanproduk.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valKode = String(item.produk?.kode ?? '').toLowerCase();
            const valNama = String(item.produk?.nama ?? '').toLowerCase();
            const valJenis = String(item.jenis ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valKode.includes(query) || valKode.includes(query) || valJenis.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPageNampanProduk) || 1;
    });

    const displayedPagesNampanProduk = computed(() => {
        const total = totalPagesNampanProduk.value;
        const current = currentPageNampanProduk.value;
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
        formPeriode,
        handleCreatePeriode,
        handleRefresh,
        errors,

        searchPeriodeStok,
        isLoadingPeriodeStok,
        PeriodeStok,
        currentPagePeriodeStok,
        itemsPerPagePeriodeStok,
        totalPagesPeriodeStok,
        displayedPagesPeriodeStok,
        fetchPeriodeStok,
        selectedPeriodeStokID,
        selectPeriodeStok,
        selectedPeriodeStokData,
        handlePilihPeriodeStok,
        handleFinalisasiPeriode,
        filteredPeriodeStok: computed(() => {
            const query = String(searchPeriodeStok.value || '').toLowerCase();
            return (PeriodeStok.value || []).filter(item =>
                String(item.kode ?? '').toLowerCase().includes(query) ||
                String(item.periode ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedPeriodeStok: computed(() => {
            const start = (currentPagePeriodeStok.value - 1) * itemsPerPagePeriodeStok;
            const query = String(searchPeriodeStok.value || '').toLowerCase();

            const filtered = (PeriodeStok.value || []).filter(item =>
                String(item.kode ?? '').toLowerCase().includes(query) ||
                String(item.periode ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPagePeriodeStok);
        }),

        searchNampanProduk,
        isLoadingNampanProduk,
        nampanproduk,
        currentPageNampanProduk,
        itemsPerPageNampanProduk,
        totalPagesNampanProduk,
        displayedPagesNampanProduk,
        fetchNampanProduk,
        rekapstok,
        filteredNampanProduk: computed(() => {
            const query = String(searchNampanProduk.value || '').toLowerCase();
            return (nampanproduk.value || []).filter(item =>

                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedNampanProduk: computed(() => {
            // PERBAIKAN: Gunakan currentPageNampanProduk.value
            const start = (currentPageNampanProduk.value - 1) * itemsPerPageNampanProduk;
            const query = String(searchNampanProduk.value || '').toLowerCase();

            const filtered = (nampanproduk.value || []).filter(item =>
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageNampanProduk);
        }),
    }
}
