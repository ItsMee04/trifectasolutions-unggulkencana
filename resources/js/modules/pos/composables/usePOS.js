import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';
import { STORAGE_URL } from '../../../helper/base';


import { jenisprodukService } from '../../../modules/jenisproduk/services/jenisprodukService'
import { nampanprodukService } from '../../nampanproduk/services/nampanprodukService'
import { pelangganService } from '../../../modules/pelanggan/services/pelangganService'
import { diskonService } from '../../../modules/diskon/services/diskonService'
import { transaksiService } from '../../../modules/transaksi/services/transaksiService'

const jenisprodukList = ref([]);
const selectedJenisProduk = ref('all');
const produk = ref([]);
const PelangganList = ref([]);
const DiskonList = ref([]);
const TransaksiID = ref('');
const selectedDiskon = ref(null);
const TransaksiDetail = ref([]);
const isLoading = ref(false);
const isLoadingProduk = ref(false);
const searchProdukQuery = ref('');
const currentPageProduk = ref(1);
const itemsPerPageProduk = 8;
// const isEdit = ref(false);
const errors = ref({});

const formPOS = reactive({
    id: null,
    pelanggan: null,
    diskon: null,
});

export function usePOS() {

    const fetchJenisProduk = async () => {
        isLoading.value = true;
        try {
            const response = await jenisprodukService.getJenisProduk();
            const mappedData = response.data.map(item => ({
                id: item.id,
                jenis: item.jenis,
                value: item.id,
                label: item.jenis
            }));

            jenisprodukList.value = [
                { id: 'all', jenis: 'SEMUA', value: 'all', label: 'SEMUA' },
                ...mappedData
            ];
        } catch (error) {
            console.error("Gagal memuat Jenis Produk:", error);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchProduk = async (jenisId = 'all') => {
        isLoadingProduk.value = true;
        try {
            const payload = {
                jenis: jenisId,
            }
            const response = await nampanprodukService.getProdukInNampanByJenis(payload);
            produk.value = response.data || [];
        } catch (error) {
            produk.value = [];
            console.error("Gagal memuat produk:", error);
        } finally {
            isLoadingProduk.value = false;
        }
    };

    const handlePilihProduk = async (kodeproduk) => {
        // 1. Validasi awal: Pastikan Kode Transaksi sudah siap
        if (!TransaksiID.value || TransaksiID.value.includes("Memuat")) {
            toast.error("Tunggu kode transaksi selesai dimuat");
            return;
        }

        // 2. Cari detail produk dari state produk local (hasil fetch produk)
        const detailProduk = produk.value.find(p => p.kodeproduk === kodeproduk);

        if (detailProduk) {
            isLoading.value = true; // Aktifkan loading state jika ada

            try {
                // 3. Susun Payload dengan menggabungkan detailProduk + Kode Transaksi
                const payload = {
                    ...detailProduk,
                    kode: TransaksiID.value // Menambahkan kode TR-xxxx
                };

                // 4. Kirim ke Service Backend
                const response = await transaksiService.storeProdukToTransaksiDetail(payload);

                if (response.data.status) {
                    toast.success(response.data.message || `Produk ${detailProduk.nama} berhasil ditambahkan`);

                    // 5. Next Step: Panggil fungsi fetch data keranjang untuk update UI tabel
                    // await fetchCartDetails();
                }

                await fetchTransaksiDetail()
            } catch (error) {
                // 6. Handling Error (Misal: produk sudah ada atau server error)
                const errorMsg = error.response?.data?.message || "Gagal menambahkan produk ke keranjang";
                toast.error(errorMsg);
                console.error("Error Store Detail:", error);
            } finally {
                isLoading.value = false;
            }
        } else {
            toast.error("Data produk tidak ditemukan");
        }
    };

    const fetchKodeTransaksi = async () => {
        TransaksiID.value = "Memuat data...";
        try {
            const response = await transaksiService.getKodeTransaksi();

            // LOGIC SYNC:
            // Jika di keranjang sudah ada barang, gunakan kode dari barang tersebut
            if (TransaksiDetail.value.length > 0) {
                TransaksiID.value = TransaksiDetail.value[0].kode;
            } else {
                // Jika keranjang kosong, baru gunakan kode baru dari backend
                TransaksiID.value = response.kode;
            }
        } catch (error) {
            TransaksiID.value = "ERR-GENERATE";
        }
    };

    const fetchPelanggan = async () => {
        try {
            const response = await pelangganService.getPelanggan();
            PelangganList.value = response.data.map(PelangganList => ({
                value: PelangganList.id,
                label: PelangganList.nama
            }));
        } catch (error) {
            toast.error("Gagal memuat Pelanggan:", error);
        }
    };

    const fetchDiskon = async () => {
        try {
            const response = await diskonService.getDiskon();
            DiskonList.value = response.data.map(DiskonList => ({
                value: DiskonList.id,
                label: DiskonList.diskon,
                nilai: DiskonList.nilai
            }));
        } catch (error) {
            toast.error("Gagal memuat Diskon:", error);
        }
    };

    const selectedDiskonNilai = computed(() => {
        return selectedDiskon.value ? selectedDiskon.value.nilai : 0;
    });

    const fetchTransaksiDetail = async () => {
        isLoading.value = true;
        try {
            const response = await transaksiService.getTransaksiDetail();
            TransaksiDetail.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            TransaksiDetail.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // 2. Fungsi Hapus Item dari Keranjang
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Hapus Item?',
            text: "Produk akan dikeluarkan dari daftar order.",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus'
        });

        if (confirm.isConfirmed) {
            isLoading.value = true;
            try {
                const payload = {
                    id: id
                }
                // Pastikan Anda sudah membuat deleteTransaksiDetail di transaksiService
                await transaksiService.batalTransaksiDetail(payload);
                toast.success("Produk berhasil dihapus");
                await fetchTransaksiDetail();
            } catch (error) {
                toast.error("Gagal menghapus produk");
            } finally {
                isLoading.value = false;
            }
        }
    };

    // Di dalam usePOS.js
    const paymentTransaksi = async (grandTotal) => {
        if (!formPOS.pelanggan) {
            toast.error("Pilih pelanggan terlebih dahulu");
            return;
        }

        isLoading.value = true;
        try {
            const payload = {
                kode: TransaksiID.value,
                pelanggan: formPOS.pelanggan.value,
                diskon: selectedDiskon.value ? selectedDiskon.value.value : null,
                total: grandTotal
            };

            const response = await transaksiService.paymentTransaksi(payload);

            if (response.status) {
                // 1. Tampilkan Modal Sukses menggunakan Bootstrap Instance
                const modalElement = document.getElementById('paymentModal');
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.show();
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran");
        } finally {
            isLoading.value = false;
        }
    };

    const handleNextOrder = async () => {
        // Reset semua state untuk transaksi baru
        formPOS.pelanggan = null;
        selectedDiskon.value = null;
        TransaksiDetail.value = [];

        await fetchKodeTransaksi();
        await fetchProduk();
        toast.info("Siap untuk transaksi baru");
    };

    const handleRefresh = async () => {
        await fetchProduk();
    }

    const totalPagesProduk = computed(() => {
        const query = String(searchProdukQuery.value || '').toLowerCase();
        const filteredCount = (produk.value || []).filter(item => {
            return String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kodeproduk ?? '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPageProduk) || 1;
    });

    const displayedPagesProduk = computed(() => {
        const total = totalPagesProduk.value;
        const current = currentPageProduk.value;
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

    return {
        jenisprodukList,
        selectedJenisProduk,
        produk,
        TransaksiID,
        PelangganList,
        DiskonList,
        selectedDiskon,
        selectedDiskonNilai,
        TransaksiDetail,
        isLoading,
        errors,
        formPOS,
        // resetForm,
        fetchJenisProduk,
        fetchProduk,
        fetchKodeTransaksi,
        fetchPelanggan,
        fetchDiskon,
        fetchTransaksiDetail,
        totalPagesProduk,
        itemsPerPageProduk,
        displayedPagesProduk,
        searchProdukQuery,
        currentPageProduk,
        filteredProduk: computed(() => {
            const query = String(searchProdukQuery.value || '').toLowerCase();
            return (produk.value || []).filter(item =>

                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedProduk: computed(() => {
            const start = (currentPageProduk.value - 1) * itemsPerPageProduk;
            const query = String(searchProdukQuery.value || '').toLowerCase();

            const filtered = (produk.value || []).filter(item =>
                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageProduk);
        }),
        handlePilihProduk,
        handleRefresh,
        handleNextOrder,
        paymentTransaksi,
        handleDelete,
    };
}
