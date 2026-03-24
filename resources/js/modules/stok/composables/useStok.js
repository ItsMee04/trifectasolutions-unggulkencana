import { ref, computed, reactive, watch } from "vue";
import toast from '../../../helper/toast'
import Swal from "sweetalert2";

import { stokService } from "../services/stokService";
import { nampanService } from "../../nampan/services/nampanService";

const PeriodeStok = ref([])
const selectedPeriodeStokID = ref(null)
const isLoadingPeriodeStok = ref(false)
const searchPeriodeStok = ref('')
const currentPagePeriodeStok = ref(1);
const itemsPerPagePeriodeStok = 5;
const nampanList = ref([])

const StokDetail = ref([])
const isLoadingStokDetail = ref(false)
const searchStokDetail = ref('')
const currentPageStokDetail = ref(1)
const itemPerPageStokDetail = 5;

const formPeriode = reactive({
    periode: '',
    nampan: null
});

const formStokDetail = reactive({
    id: null,
    jenisproduk: null,
    potong: '',
    berat: ''
})

const errors = ref({});

const fetchStokDetail = async () => {
    if (!selectedPeriodeStokID.value) return;

    isLoadingStokDetail.value = true;

    try {
        const payload = {
            kode: selectedPeriodeStokID.value
        }

        const response = await stokService.getStokOpnameDetail(payload)
        StokDetail.value = Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
        StokDetail.value = [];
    } finally {
        isLoadingStokDetail.value = false;
    }
}

watch(selectedPeriodeStokID, (newId) => {
    if (newId) {
        currentPageStokDetail.value = 1; // Reset halaman PRODUK saja ke 1
        fetchStokDetail();
    }
})


export function useStok() {

    const fetchPeriodeStok = async () => {
        isLoadingPeriodeStok.value = true;

        try {
            const response = await stokService.getPeriodeStok();
            PeriodeStok.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            PeriodeStok.value = [];
            console.log(error);
        } finally {
            isLoadingPeriodeStok.value = false;
        }
    }

    const fetchNampan = async () => {
        try {
            const response = await nampanService.getNampan();
            nampanList.value = response.data.map(nampanList => ({
                value: nampanList.id,
                label: nampanList.nampan
            }))
        } catch(error) {
            toast.error("Gagal memuat data nampan")
            console.log(error)
        }
    }

    const selectPeriodeStokOpname = (kode) => {
        selectedPeriodeStokID.value = kode;
    };

    const selectedPeriodeOpnameData = computed(() => {
        return PeriodeStok.value.find(item => item.kode === selectedPeriodeStokID.value) || {};
        // Mengembalikan {} (objek kosong) jika tidak ketemu, bukan null
    });

    const handlePilihStokOpname = (item) => {
        // 1. Update ID di composable agar class CSS ':class' aktif
        // selectPeriodeStokOpname(item.kode);
        // 1. Berikan nilai ke ref selectedPeriodeStokID
        selectedPeriodeStokID.value = item.kode;

        selectPeriodeStokOpname(selectedPeriodeStokID.value)
    }

    const validateForm = () => {
        errors.value = {}; // Reset error sebelumnya

        // Validasi field periode
        if (!formPeriode.periode || formPeriode.periode.trim() === '') {
            // 1. Masukkan ke state errors agar pengecekan di bawah berhasil
            errors.value.periode = ["Tanggal tidak boleh kosong."];

            // 2. Beri peringatan toast
            toast.error("Tanggal tidak boleh kosong.");
        }

        // Jika errors.value kosong, return true (artinya valid)
        // Jika ada isinya, return false (artinya tidak valid)
        return Object.keys(errors.value).length === 0;
    };

    const handleCreatePeriode = async () => {
        // Jika validateForm return false, eksekusi berhenti di sini
        if (!validateForm()) return false;

        isLoadingPeriodeStok.value = true;

        try {
            const payload = {
                periode: formPeriode.periode
            };

            const response = await stokService.storePeriodeStok(payload);
            toast.success(response.message || 'Data berhasil disimpan');

            // Reset form setelah sukses
            formPeriode.periode = '';
            await fetchPeriodeStok();

        } catch (error) {
            // Kita hanya perlu menangkap 422 untuk sinkronisasi UI/state errors
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
                // Pesan toast sudah ditangani secara global oleh API Client Interceptor
            }
            return false;
        } finally {
            isLoadingPeriodeStok.value = false;
        }
    };

    const handleRefresh = async () => {
        await fetchPeriodeStok();
    }

    const totalPagesPeriodeStok = computed(() => {
        const query = String(searchPeriodeStok.value || '').toLowerCase();
        const filteredCount = (PeriodeStok.value || []).filter(item => {
            const valKode = String(item.kode ?? '').toLowerCase();
            const valPeriode = String(item.periode ?? '').toLowerCase();

            return valKode.includes(query) || valPeriode.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePeriodeStok) || 1;
    })

    const totalPagesStokDetail = computed(() => {
        const query = String(searchStokDetail.value || []).toLowerCase();
        const filteredCount = (StokDetail.value || []).filter(item => {
            const valBerat = String(item.berat || '').toLowerCase();
            const valPotong = String(item.potong || '').toLowerCase();

            return valBerat.includes(query) || valPotong.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemPerPageStokDetail) || 1;
    });

    const displayedPagesPeriodeStok = computed(() => {
        const total = totalPagesPeriodeStok.value;
        const current = currentPagePeriodeStok.value;
        const maxVisible = 3;

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;

        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages;
    });

    const displayedStokDetail = computed(() => {
        const total = totalPagesStokDetail.value;
        const current = currentPageStokDetail.value;
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

    return {
        formPeriode,
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
        selectedPeriodeOpnameData,
        nampanList,
        fetchNampan,
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
        handleCreatePeriode,
        handleRefresh,

        StokDetail,
        currentPageStokDetail,
        itemPerPageStokDetail,
        totalPagesStokDetail,
        displayedStokDetail,
        filteredStokDetail: computed(() => {
            const query = String(searchStokDetail.value || '').toLowerCase();
            return (StokDetail.value || []).filter(item =>
                String(item.berat ?? '').toLowerCase().includes(query) ||
                String(item.potong ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedStokDetail: computed(() => {
            const start = (currentPageStokDetail.value - 1) * itemPerPageStokDetail;
            const query = String(searchStokDetail.value || '').toLowerCase();

            const filtered = (StokDetail.value || []).filter(item =>
                String(item.berat ?? '').toLowerCase().includes(query) ||
                String(item.potong ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemPerPageStokDetail);
        }),
        handlePilihStokOpname,
        searchStokDetail,
    }
}
