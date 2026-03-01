import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pembeliandariluartokoService } from '../services/pembeliandariluartokoService'
import { suplierService } from '../../../modules/suplier/services/suplierService'
import { pelangganService } from '../../../modules/pelanggan/services/pelangganService'
import { kondisiService } from '../../kondisi/services/kondisiService'
import { jenisprodukService } from '../../jenisproduk/services/jenisprodukService';
import { jeniskaratService } from '../../jeniskarat/services/jeniskaratService';
import { karatService } from '../../karat/services/karatService';

import { useSuplier } from '../../suplier/composables/useSuplier';
import { usePelanggan } from '../../pelanggan/composables/usePelanggan';

// STATE GLOBAL (SINGLETON) - Dipindah ke luar agar data tidak hilang & mencegah double fetch
const supplierOptions = ref([]);
const pelangganOptions = ref([]);
const isFetchingList = ref(false);

const PembelianDariLuarToko = ref([]);

// STATE MODAL & FORM
const isEdit = ref(false);
const isLoading = ref(false);
const errors = ref({});
const jenisprodukList = ref([]);
const karatList = ref([]);
const allJenisKarat = ref([]);
const kondisiList = ref([]);

// STATE TABEL
const isLoadingPembelianDetail = ref(false);
const searchPembelianDetail = ref('')
const currentPagePembelianDetail = ref(1);
const itemsPerPagePembelianDetail = 5;
const pembeliandetail = ref([]);

const formDariLuarToko = reactive({
    kode: '',
    sumber: 'supplier', // Default
    selectedId: null,
    keterangan: ''
});

const formProduk = reactive({
    nama: '',
    berat: '',
    jenisproduk: null,
    karat: null,
    kondisi: null,
    hargabeli: '',
    jeniskarat: null,
    lingkar: '',
    panjang: '',
    keteranganproduk: ''
});

export function usePembelianDariLuarToko() {

    const { handleCreate: openSuplierModal } = useSuplier();
    const { handleCreate: openPelangganModal } = usePelanggan();

    const fetchKodeTransaksi = async () => {
        formDariLuarToko.kode = "Memuat data...";
        try {
            const response = await pembeliandariluartokoService.getKodeTransaksi();
            if (PembelianDariLuarToko.value.length > 0) {
                formDariLuarToko.kode = PembelianDariLuarToko.value[0].kode;
            } else {
                formDariLuarToko.kode = response.kode;
            }
        } catch (error) {
            formDariLuarToko.kode = "ERR-GENERATE";
        }
    };

    // REVISI UTAMA: Fungsi Fetch dengan Guard Clause
    const fetchOptions = async (type, force = false) => {
        if (!type) return;

        // 1. Cegah request jika sedang berjalan (Mencegah 3x panggil sekaligus)
        if (isFetchingList.value) return;

        // 2. Cegah request jika data sudah ada (Caching), kecuali dipaksa (force)
        if (!force) {
            if (type === 'supplier' && supplierOptions.value.length > 0) return;
            if (type === 'pelanggan' && pelangganOptions.value.length > 0) return;
        }

        isFetchingList.value = true;
        formDariLuarToko.selectedId = null;

        try {
            if (type === 'supplier') {
                const response = await suplierService.getSuplier();
                supplierOptions.value = response.data.map(item => ({
                    value: item.id,
                    label: item.nama
                }));
            } else {
                const response = await pelangganService.getPelanggan();
                pelangganOptions.value = response.data.map(item => ({
                    value: item.id,
                    label: item.nama
                }));
            }
        } catch (error) {
            console.error("Gagal ambil list:", error);
        } finally {
            // Beri sedikit delay pada flag loading agar tidak terjadi race condition
            setTimeout(() => {
                isFetchingList.value = false;
            }, 300);
        }
    };

    const handleModalClosed = (event) => {
        // REVISI: Hanya refresh jika modal yang ditutup adalah modal input data person
        const modalId = event.target.id;
        if (modalId === 'suplierModal' || modalId === 'pelangganModal') {
            fetchOptions(formDariLuarToko.sumber, true); // Force True untuk ambil data terbaru
        }
    };

    onMounted(() => {
        document.addEventListener('hidden.bs.modal', handleModalClosed);
    });

    onUnmounted(() => {
        document.removeEventListener('hidden.bs.modal', handleModalClosed);
    });

    // REVISI: Hapus pemanggilan fetch manual di sini (Double pemicu)
    const handleCreateSuplier = async () => {
        openSuplierModal();
        // fetch sudah dihandle otomatis oleh handleModalClosed saat modal ditutup
    }

    const handleCreatePelanggan = async () => {
        openPelangganModal();
        // fetch sudah dihandle otomatis oleh handleModalClosed saat modal ditutup
    }

    const handleCreateProduk = () => {
        isEdit.value = false;
        formProduk.nama = '';
        const modal = new bootstrap.Modal(document.getElementById('produkModal'));
        modal.show();
    };

    const fetchJenisProduk = async () => {
        try {
            const response = await jenisprodukService.getJenisProduk();
            jenisprodukList.value = response.data.map(item => ({
                value: item.id,
                label: item.jenis
            }));
        } catch (error) {
            console.error("Gagal memuat Jenis Produk:", error);
        }
    };

    const fetchKarat = async () => {
        try {
            const response = await karatService.getKarat();
            karatList.value = response.data.map(item => ({
                value: item.id,
                label: item.karat,
            }));
        } catch (error) {
            console.log("Gagal memuat Karat", error)
        }
    };

    const fetchJenisKarat = async () => {
        try {
            const response = await jeniskaratService.getJenisKarat();
            allJenisKarat.value = response.data;
        } catch (error) {
            console.error("Gagal memuat Jenis Karat:", error);
        }
    };

    const filteredJenisKaratList = computed(() => {
        if (!formProduk.karat || !formProduk.karat.value) return [];
        return allJenisKarat.value
            .filter(item => item.karat_id === formProduk.karat.value)
            .map(item => ({
                value: item.id,
                label: item.jenis
            }));
    });

    const handleKaratChange = () => {
        formProduk.jeniskarat = null;
    };

    // REVISI: Matikan immediate agar tidak bentrok dengan onMounted di View
    watch(
        () => formDariLuarToko.sumber,
        (newType) => {
            if (newType) {
                fetchOptions(newType);
            }
        },
        { immediate: false }
    );

    const fetchKondisi = async () => {
        try {
            const response = await kondisiService.getKondisi();
            kondisiList.value = response.data.map(item => ({
                value: item.id,
                label: item.kondisi
            }));
        } catch (error) {
            console.error("Gagal memuat Kondisi:", error);
        }
    };

    const validateForm = () => {
        errors.value = {};
        if (!formProduk.nama || formProduk.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }
        if (!formProduk.berat || String(formProduk.berat).trim() === '') {
            errors.value.berat = 'Berat tidak boleh kosong.';
        } else {
            const beratRegex = /^\d+(\.\d+)?$/;
            if (String(formProduk.berat).includes(',')) {
                errors.value.berat = 'Gunakan titik (.) sebagai pemisah desimal, bukan koma.';
            } else if (!beratRegex.test(formProduk.berat)) {
                errors.value.berat = 'Format berat tidak valid (contoh: 10.5).';
            }
        }
        if (!formProduk.jenisproduk || formProduk.jenisproduk === null) {
            errors.value.jenisproduk = 'Jenis Produk wajib dipilih.';
        }
        if (!formProduk.karat || formProduk.karat === null) {
            errors.value.karat = 'Karat wajib dipilih.';
        }
        if (!formProduk.jeniskarat || formProduk.jeniskarat === null) {
            errors.value.jeniskarat = 'Jenis Karat wajib dipilih.';
        }
        if (!formProduk.kondisi || formProduk.kondisi === null) {
            errors.value.kondisi = 'Kondisi wajib dipilih.';
        }
        if (!formProduk.hargabeli || String(formProduk.hargabeli).trim() === '') {
            errors.value.hargabeli = 'Harga beli tidak boleh kosong.';
        } else {
            const hargaRegex = /^\d+$/;
            if (!hargaRegex.test(formProduk.hargabeli)) {
                errors.value.hargabeli = 'Harga beli harus berupa angka tanpa simbol.';
            }
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleSubmitProduk = async () => {
        if (!validateForm()) return false;
        const payload = {
            nama: formProduk.nama,
            berat: formProduk.berat,
            jenisproduk: formProduk.jenisproduk.value,
            karat: formProduk.karat.value,
            jeniskarat: formProduk.jeniskarat.value,
            kondisi: formProduk.kondisi.value,
            hargabeli: formProduk.hargabeli,
            lingkar: formProduk.lingkar,
            panjang: formProduk.panjang,
            keterangan: formProduk.keteranganproduk
        }
        console.log(payload)
    }

    const fetchPembelianDetail = async () => {
        isLoadingPembelianDetail.value = true;
        try {
            const response = await pembeliandariluartokoService.getPembelianDetail();
            pembeliandetail.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            pembeliandetail.value = [];
        } finally {
            isLoadingPembelianDetail.value = false;
        }
    }

    const totalPagesPembelianDetail = computed(() => {
        const query = String(searchPembelianDetail.value || '').toLowerCase();
        const filteredCount = (pembeliandetail.value || []).filter(item => {
            return String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
        }).length;
        return Math.ceil(filteredCount / itemsPerPagePembelianDetail) || 1;
    });

    const displayedPagesPembelianDetail = computed(() => {
        const total = totalPagesPembelianDetail.value;
        const current = currentPagePembelianDetail.value;
        const maxVisible = 5;
        let start = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;
        if (end > total) {
            end = total;
            start = Math.max(end - maxVisible + 1, 1);
        }
        const pages = [];
        for (let i = start; i <= end; i++) { pages.push(i) }
        return pages;
    })

    return {
        errors,
        PembelianDariLuarToko,
        isFetchingList,
        supplierOptions,
        pelangganOptions,
        formDariLuarToko,
        fetchKodeTransaksi,
        fetchOptions, // WAJIB DI EXPORT
        handleCreateSuplier,
        handleCreatePelanggan,
        isEdit,
        isLoading,
        formProduk,
        handleCreateProduk,
        jenisprodukList,
        jeniskaratList: filteredJenisKaratList,
        karatList,
        kondisiList,
        allJenisKarat,
        fetchJenisProduk,
        fetchKarat,
        fetchJenisKarat,
        fetchKondisi,
        handleKaratChange,
        handleSubmitProduk,
        isLoadingPembelianDetail,
        searchPembelianDetail,
        currentPagePembelianDetail,
        itemsPerPagePembelianDetail,
        totalPagesPembelianDetail,
        displayedPagesPembelianDetail,
        fetchPembelianDetail,
        paginatedPembelianDetail: computed(() => {
            const query = String(searchPembelianDetail.value || '').toLowerCase();
            const filtered = (pembeliandetail.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );
            const start = (currentPagePembelianDetail.value - 1) * itemsPerPagePembelianDetail;
            return filtered.slice(start, start + itemsPerPagePembelianDetail);
        }),
        filteredPembelianDetail: computed(() => {
            const query = String(searchPembelianDetail.value || '').toLowerCase();
            return (pembeliandetail.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );
        }),
    };
}
