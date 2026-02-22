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
const searchNampanQuery = ref('');
const searchNampanProdukQuery = ref('')
const currentPage = ref(1);
const currentPageNampanProduk = ref(1);
const itemsPerPageNampan = 5;
const itemsPerPageNampanProduk = 10;
const isEdit = ref(false)
const errors = ref({});

const formNampanProduk = reactive({
    id: null,
    produk: ''
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

    const handleRefresh = async () => {
        await fetchNampan();
    }

    return {
        nampan,
        nampanproduk,
        selectedNampanId,
        selectNampan,
        selectedNampanData,
        handlePilihNampan,
        currentPage,
        currentPageNampanProduk,
        itemsPerPageNampan,
        itemsPerPageNampanProduk,
        totalPagesNampan,
        totalPagesNampanProduk,
        displayedPagesNampan,
        displayedPagesNampanProduk,
        fetchNampan,
        fetchNampanProduk,
        searchNampanQuery,
        searchNampanProdukQuery,
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
        isLoading,
        isLoadingNampanProduk,
        isEdit,
        errors,
        formNampanProduk,
        handleRefresh,
    }
}
