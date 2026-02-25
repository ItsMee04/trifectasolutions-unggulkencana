import { ref, computed, reactive, watch } from "vue";
import toast from "../../../helper/toast";
import Swal from "sweetalert2";

import { nampanprodukService } from '../services/nampanprodukService';
import { nampanService } from "../../nampan/services/nampanService";
import { produkService } from '../../../modules/produk/services/produkService'

const nampanproduk = ref([]);
const nampan = ref([]);
const selectedNampanId = ref(null);
const produk = ref([]);
const isLoading = ref(false);
const isLoadingNampanProduk = ref(false);
const isLoadingProduk = ref(false);
const searchNampanQuery = ref('');
const searchNampanProdukQuery = ref('')
const searchProdukQuery = ref('');
const currentPage = ref(1);
const currentPageNampanProduk = ref(1);
const currentPageProduk = ref(1);
const itemsPerPageNampan = 5;
const itemsPerPageNampanProduk = 10;
const itemsPerPageProduk = 10;
const isEdit = ref(false)
const errors = ref({});
const selectedProdukIds = ref([]);
const targetPindahItem = ref(null);

const formNampanProduk = reactive({
    id: null,
    produk: '',
    nampantujuan_id: '' // Tambahkan ini
})

const fetchNampanProduk = async () => {
    if (!selectedNampanId.value) return;

    isLoadingNampanProduk.value = true;
    try {
        const payload = {
            id: selectedNampanId.value
        }
        // Memanggil service berdasarkan ID nampan yang aktif
        const response = await nampanprodukService.getNampanProdukByNampan(payload);
        nampanproduk.value = Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        nampanproduk.value = [];
    } finally {
        // Memberikan jeda sedikit agar transisi "Memuat data..." terlihat halus
        isLoadingNampanProduk.value = false;
    }
}

watch(selectedNampanId, (newId) => {
    if (newId) {
        currentPageNampanProduk.value = 1; // Reset halaman PRODUK saja ke 1
        fetchNampanProduk();
    }
})

export function useNampanProduk() {

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

    const selectNampan = (id) => {
        selectedNampanId.value = id;
    };

    const selectedNampanData = computed(() => {
        return nampan.value.find(item => item.id === selectedNampanId.value) || {};
        // Mengembalikan {} (objek kosong) jika tidak ketemu, bukan null
    });

    const handlePilihNampan = (item) => {
        // 1. Update ID di composable agar class CSS ':class' aktif
        selectNampan(item.id);
    }

    const handleCreate = async () => {
        if (!selectedNampanId.value) {
            toast.error("Silahkan pilih nampan terlebih dahulu!");
            return false;
        }

        // 1. Ambil nilai jenisproduk_id dari data nampan yang dipilih
        // Menggunakan optional chaining (?.) untuk menghindari error jika data belum load
        const jenisProdukId = selectedNampanData.value?.jenisproduk_id || selectedNampanData.value?.jenisproduk?.id;

        try {
            const payload = {
                jenisproduk: jenisProdukId
            }
            // Memanggil service berdasarkan ID nampan yang aktif
            const response = await nampanprodukService.getProdukByJenisNampan(payload);
            produk.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            produk.value = [];
        }

        // 3. Jika Anda ingin memasukkan nilai ini secara otomatis ke form modal:
        // formNampanProduk.jenisproduk_id = jenisProdukId;

        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('nampanprodukModal'));
        modal.show();
    };

    const submitProduk = async () => {
        // 1. Validasi Client-side (Dasar)
        if (selectedProdukIds.value.length === 0) {
            toast.error("Silahkan pilih setidaknya satu produk!");
            return;
        }

        if (!selectedNampanId.value) {
            toast.error("Data nampan tidak ditemukan!");
            return;
        }

        isLoadingProduk.value = true;
        try {
            const payload = {
                nampan_id: selectedNampanId.value,
                produk_id: selectedProdukIds.value
            };

            // Kirim ke Service
            const response = await nampanprodukService.storeNampanProduk(payload);

            // Jika backend mengirim status success (200)
            // Kita gunakan response.data.message agar pesan dinamis dari Laravel muncul
            toast.success(response.data.message || "Produk berhasil diproses");

            // Reset & Refresh
            selectedProdukIds.value = [];
            await fetchNampanProduk();

            // Tutup Modal
            const modalElement = document.getElementById('nampanprodukModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

        } catch (error) {
            // Jika backend melempar 422 (duplikat), pesan dari Laravel akan ditangkap disini
            const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data";
            toast.error(errorMessage);
        } finally {
            isLoadingProduk.value = false;
        }
    };

    // 1. Filter Nampan: Jenis sama dengan produk, tapi bukan nampan asal
    const availableNampanTujuan = computed(() => {
        if (!targetPindahItem.value) return [];

        // Ambil jenisproduk_id dari produk yang ada di baris tersebut
        const jenisIdTarget = targetPindahItem.value.produk?.jenisproduk_id;

        return nampan.value.filter(n =>
            n.jenisproduk_id === jenisIdTarget &&
            n.id !== selectedNampanId.value
        );
    });

    const handlePindah = (item) => {
        isEdit.value = true;
        errors.value = {};

        targetPindahItem.value = item;

        // Mapping data ke form untuk modal
        formNampanProduk.id = item.id; // ID relasi nampan_produk
        formNampanProduk.produk = item.produk?.nama;
        formNampanProduk.nampantujuan_id = ''; // Reset pilihan

        const modal = new bootstrap.Modal(document.getElementById('nampanprodukpindahModal'));
        modal.show();
    };

    // 3. Fungsi Submit Pindah
    const submitPindah = async () => {
        if (!formNampanProduk.nampantujuan_id) {
            toast.error("Silahkan pilih nampan tujuan!");
            return;
        }

        isLoadingProduk.value = true;
        try {
            const payload = {
                produk: formNampanProduk.id, // ID nampan_produk
                nampan: formNampanProduk.nampantujuan_id?.id
            };

            const response = await nampanprodukService.pindahNampanProduk(payload);
            toast.success(response.message || "Produk berhasil dipindahkan");

            // Refresh tabel (Produk akan hilang dari nampan asal karena nampan_id berubah)
            await fetchNampanProduk();

            // Tutup Modal
            const modalElement = document.getElementById('nampanprodukpindahModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        } catch (error) {
            const errorMessage = error.response?.message || "Gagal memindahkan produk";
            toast.error(errorMessage);
        } finally {
            isLoadingProduk.value = false;
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Produk "${item.produk?.nama}" yang dihapus tidak dapat dikembalikan!`,
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
                    produk: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await nampanprodukService.deleteNampanProduk(payload);

                toast.success('Produk berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchNampanProduk();
            } catch (error) {
                console.error('Gagal menghapus data Produk:', error);
                toast.error('Gagal menghapus data Produk.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const totalPagesNampan = computed(() => {
        const query = String(searchNampanQuery.value || '').toLowerCase();
        const filteredCount = (nampan.value || []).filter(item => {
            // Ambil nilai jenis dan karat, paksa jadi string
            const valNampan = String(item.nampan ?? '').toLowerCase();
            const valJenisProduk = String(item.jenisproduk?.jenis ?? '').toLowerCase();

            // Cek apakah query ada di salah satu kolom tersebut
            return valNampan.includes(query) || valJenisProduk.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPageNampan) || 1;
    });

    const totalPagesNampanProduk = computed(() => {
        const query = String(searchNampanProdukQuery.value || '').toLowerCase();
        // PERBAIKAN: Gunakan nampanproduk.value, bukan nampan.value
        const filteredCount = (nampanproduk.value || []).filter(item => {
            return String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPageNampanProduk) || 1;
    });

    const totalPagesProduk = computed(() => {
        const query = String(searchProdukQuery.value || '').toLowerCase();
        // PERBAIKAN: Gunakan nampanproduk.value, bukan nampan.value
        const filteredCount = (produk.value || []).filter(item => {
            return String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kodeproduk ?? '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPageProduk) || 1;
    });

    const displayedPagesNampan = computed(() => {
        const total = totalPagesNampan.value;
        const current = currentPage.value;
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

    const displayedPagesNampanProduk = computed(() => {
        const total = totalPagesNampanProduk.value;
        const current = currentPageNampanProduk.value; // PERBAIKAN: Gunakan currentPageNampanProduk
        const maxVisible = 5;

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;
        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    });

    const displayedPagesProduk = computed(() => {
        const total = totalPagesProduk.value;
        const current = currentPageProduk.value; // PERBAIKAN: Gunakan currentPageNampanProduk
        const maxVisible = 5;

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;
        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    });

    const handleRefresh = async () => {
        await fetchNampan();
    }

    return {
        nampan,
        nampanproduk,
        produk,
        selectedNampanId,
        selectNampan,
        selectedNampanData,
        handlePilihNampan,
        currentPage,
        currentPageNampanProduk,
        currentPageProduk,
        itemsPerPageNampan,
        itemsPerPageNampanProduk,
        itemsPerPageProduk,
        totalPagesNampan,
        totalPagesNampanProduk,
        totalPagesProduk,
        displayedPagesNampan,
        displayedPagesNampanProduk,
        displayedPagesProduk,
        fetchNampan,
        fetchNampanProduk,
        searchNampanQuery,
        searchNampanProdukQuery,
        searchProdukQuery,
        filteredNampan: computed(() => {
            const query = String(searchNampanQuery.value || '').toLowerCase();
            return (nampan.value || []).filter(item =>
                String(item.nampan ?? '').toLowerCase().includes(query) ||
                String(item.jenisproduk?.jenis ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedNampan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPageNampan;
            const query = String(searchNampanQuery.value || '').toLowerCase();

            const filtered = (nampan.value || []).filter(item =>
                String(item.nampan ?? '').toLowerCase().includes(query) ||
                String(item.jenisproduk?.jenis ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageNampan);
        }),
        filteredNampanProduk: computed(() => {
            const query = String(searchNampanProdukQuery.value || '').toLowerCase();
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
            const query = String(searchNampanProdukQuery.value || '').toLowerCase();

            const filtered = (nampanproduk.value || []).filter(item =>
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.jenis ?? '').toLowerCase().includes(query) ||
                String(item.tanggal ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageNampanProduk);
        }),
        filteredProduk: computed(() => {
            const query = String(searchProdukQuery.value || '').toLowerCase();
            return (produk.value || []).filter(item =>

                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedProduk: computed(() => {
            // PERBAIKAN: Gunakan currentPageNampanProduk.value
            const start = (currentPageProduk.value - 1) * itemsPerPageProduk;
            const query = String(searchProdukQuery.value || '').toLowerCase();

            const filtered = (produk.value || []).filter(item =>
                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageProduk);
        }),
        isLoading,
        isLoadingNampanProduk,
        isLoadingProduk,
        isEdit,
        errors,
        formNampanProduk,
        handleCreate,
        availableNampanTujuan,
        submitPindah,
        targetPindahItem,
        handlePindah,
        handleDelete,
        handleRefresh,
        selectedProdukIds,
        submitProduk,
    }
}
