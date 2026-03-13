import { ref, computed, reactive, watch } from "vue";
import toast from '../../../helper/toast'
import Swal from "sweetalert2";

import { stokService } from "../services/stokService";

const PeriodeStok = ref([])
const selectedPeriodeStokID = ref(null)
const isLoadingPeriodeStok = ref(false)
const searchPeriodeStok = ref('')
const currentPagePeriodeStok = ref(1);
const itemsPerPagePeriodeStok = 5;

const formPeriode = reactive({
    periode:''
});

const errors = ref({});

export function useStok(){

    const fetchPeriodeStok = async () => {
        isLoadingPeriodeStok.value = true;

        try {
            const response = await stokService.getPeriodeStok();
            PeriodeStok.value = Array.isArray(response) ? response : (response.data || []);
        } catch(error) {
            PeriodeStok.value = [];
            console.log(error);
        } finally {
            isLoadingPeriodeStok.value = false;
        }
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
            const valKode       = String(item.kode ?? '').toLowerCase();
            const valPeriode    = String(item.periode ?? '').toLowerCase();

            return valKode.includes(query) || valPeriode.includes(query);
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePeriodeStok) || 1;
    })

    const displayedPagesPeriodeStok = computed(() => {
        const total = totalPagesPeriodeStok.value;
        const current = currentPagePeriodeStok.value;
        const maxVisible = 3;

        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;

        if(end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++){
            pages.push(i)
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
        filteredPeriodeStok: computed(() => {
            const query = String(searchPeriodeStok.value || '').toLowerCase();
            return (PeriodeStok.value || []).filter(item =>
                String(item.kode ?? '').toLowerCase().includes(query) ||
                String(item.periode ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedPeriodeStok: computed(() => {
            const start = (currentPagePeriodeStok.value -1) * itemsPerPagePeriodeStok;
            const query = String(searchPeriodeStok.value || '').toLowerCase();

            const filtered = (PeriodeStok.value || []).filter(item =>
                String(item.kode ?? '').toLowerCase().includes(query) ||
                String(item.periode ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPagePeriodeStok);
        }),
        handleCreatePeriode,
        handleRefresh,
    }
}
