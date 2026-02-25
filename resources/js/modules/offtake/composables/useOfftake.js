import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { offtakeService } from '../services/offtakeService';
import { suplierService } from '../../../modules/suplier/services/suplierService';
import { nampanprodukService } from '../../nampanproduk/services/nampanprodukService';

const offtake = ref([]);
const offtakeDetail = ref([]);
const suplierList = ref([]);
const produk = ref([]);
const isLoading = ref(false);
const isLoadingProduk = ref(false);
const TransaksiID = ref('');
const OfftakeDetail = ref([]);
const searchQuery = ref('');
const searchProdukQuery = ref('');
const searchOfftakeDetailQuery = ref('');
const currentPage = ref(1);
const currentPageProduk = ref(1);
const currentPageOfftakeDetail = ref(1);
const itemsPerPage = 10;
const itemsPerPageProduk = 10;
const itemsPerPageOfftakeDetail = 5;
const selectedProdukIds = ref([]);
const lastCompletedOfftakeKode = ref('');
const isEdit = ref(false);
const errors = ref({});

const formOfftake = reactive({
    id: null,
    kode: null,
    suplier: null,
    harga: '',
    keterangan: ''
});

export function useOfftake() {

    const fetchOfftakeDetail = async () => {
        isLoading.value = true;
        try {
            const response = await offtakeService.getOfftakeDetail();
            offtakeDetail.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            offtakeDetail.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const fetchSuplier = async () => {
        try {
            const response = await suplierService.getSuplier();
            // Gunakan optional chaining (?.) untuk keamanan data
            if (response?.data) {
                suplierList.value = response.data.map(item => ({
                    value: item.id,
                    label: item.nama
                }));
            }
        } catch (error) {
            console.error("Gagal memuat Suplier:", error);
            suplierList.value = []; // Kembalikan ke array kosong jika gagal
        }
    };

    const fetchKodeTransaksi = async () => {
        formOfftake.kode = "Memuat data...";
        try {
            const response = await offtakeService.getKodeTransaksi();

            // LOGIC SYNC:
            // Jika di keranjang sudah ada barang, gunakan kode dari barang tersebut
            if (OfftakeDetail.value.length > 0) {
                formOfftake.kode = OfftakeDetail.value[0].kode;
            } else {
                // Jika keranjang kosong, baru gunakan kode baru dari backend
                formOfftake.kode = response.kode;
            }
        } catch (error) {
            formOfftake.kode = "ERR-GENERATE";
        }
    };

    // --- LOGIKA VALIDASI ---
    const validateForm = () => {
        errors.value = {}; // Reset error

        // Validasi jenis karat
        if (!formOfftake.kode || formOfftake.kode.trim() === '') {
            errors.value.kode = 'Kode tidak boleh kosong.';
        }

        if (!formOfftake.suplier || formOfftake.suplier === null) {
            errors.value.suplier = 'Karat wajib dipilih.';
        }

        if (!formOfftake.harga || formOfftake.harga === '') {
            errors.value.harga = 'Harga tidak boleh kosong.';
        } else if (isNaN(formOfftake.harga)) {
            errors.value.harga = 'Harga harus berupa angka.';
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleCreate = async () => {
        errors.value = {};
        try {
            // Memanggil service berdasarkan ID nampan yang aktif
            const response = await nampanprodukService.getNampanProduk();
            produk.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            produk.value = [];
        }
        const modal = new bootstrap.Modal(document.getElementById('offtakeModal'));
        modal.show();
    };


    const filteredProduk = computed(() => {
        const query = String(searchProdukQuery.value || '').toLowerCase();
        return (produk.value || []).filter(item =>

            String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
            String(item.produk?.nama ?? '').toLowerCase().includes(query)
        );
    })

    const submitProduk = async () => {
        // 1. Validasi
        if (selectedProdukIds.value.length === 0) {
            toast.error("Silahkan pilih setidaknya satu produk!");
            return;
        }

        // 2. Mapping data produk (Hanya array produk saja)
        const items = filteredProduk.value
            .filter(item => selectedProdukIds.value.includes(item.id))
            .map(item => ({
                produk_id: item.produk_id,
                harga: item.produk?.harga?.harga || 0,
                berat: item.produk?.berat || 0,
                karat: item.produk?.karat?.karat || 0,
                lingkar: item.produk?.lingkar || 0,
                panjang: item.produk?.panjang || 0,
            }));

        // 3. Susun payload final (GABUNGAN Kode & Items)
        // Inilah yang akan diterima oleh parameter 'payload' di service Anda
        const finalPayload = {
            kode: formOfftake.kode, // Ambil dari form header
            items: items            // Array hasil mapping di atas
        };

        isLoadingProduk.value = true;
        try {
            // 4. Panggil service dengan satu parameter payload
            const response = await offtakeService.storeProdukToOfftakeDetail(finalPayload);

            // Karena service Anda me-return response.data, maka:
            toast.success(response.message || "Produk berhasil diproses");

            // Reset & Refresh
            selectedProdukIds.value = [];
            await fetchOfftakeDetail(); // Muat ulang tabel detail

            // Tutup Modal
            const modalElement = document.getElementById('offtakeModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

        } catch (error) {
            // Jika service melempar error, tangkap pesan dari backend
            const errorMessage = error.response?.data?.message || "Terjadi kesalahan";
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
                    id: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await offtakeService.batalOfftakeDetail(payload);

                toast.success('Produk berhasil dihapus.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchOfftakeDetail();

                // 2. LOGIC RE-GENERATE KODE:
                // Jika setelah fetch detail ternyata kosong, ambil kode transaksi baru
                if (offtakeDetail.value.length === 0) {
                    await fetchKodeTransaksi();
                    // Reset form lainnya jika perlu
                }
            } catch (error) {
                console.error('Gagal menghapus data Produk:', error);
                toast.error('Gagal menghapus data Produk.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const paymentOfftake = async () => {
        // 1. Validasi Suplier
        if (!formOfftake.suplier) {
            toast.error("Pilih suplier terlebih dahulu");
            return;
        }

        // 2. Validasi Keranjang (Mencegah bayar transaksi kosong)
        if (offtakeDetail.value.length === 0) {
            toast.error("Keranjang masih kosong");
            return;
        }

        isLoading.value = true;
        try {
            // 3. Susun Payload (Sesuaikan dengan field di Controller)
            const payload = {
                kode: formOfftake.kode,
                suplier_id: formOfftake.suplier.value, // Sesuai dengan formOfftake.suplier (id dari multiselect)
                total: formOfftake.harga,        // Nilai uang yang masuk
                keterangan: formOfftake.keterangan
            };

            const response = await offtakeService.paymentOfftake(payload);

            if (response.status) {
                // Simpan kode transaksi yang baru selesai untuk keperluan cetak nota di modal
                lastCompletedOfftakeKode.value = formOfftake.kode;

                // 4. Reset form header agar bersih untuk transaksi berikutnya
                formOfftake.suplier = null;
                formOfftake.keterangan = '';
                formOfftake.harga = '';

                // 5. Refresh data (Ambil kode baru & kosongkan tabel detail)
                // Sesuai instruksi: UI akan menampilkan "Memuat data..." saat fetch ini berjalan
                await fetchOfftakeDetail();
                await fetchKodeTransaksi();

                // 6. Tampilkan Modal Sukses (Payment Complete)
                // Pastikan di View Anda sudah ada <div id="paymentCompleteModal">
                const modalElement = document.getElementById('paymentCompleteModal');
                if (modalElement) {
                    const modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                } else {
                    toast.success("Pembayaran Berhasil");
                }
            }
        } catch (error) {
            console.error("Error Payment Offtake:", error);
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran offtake");
        } finally {
            isLoading.value = false;
        }
    };

    const totalProduk = computed(() => offtakeDetail.value.length);

    const totalBerat = computed(() => {
        return offtakeDetail.value.reduce((acc, item) => acc + Number(item.berat || 0), 0);
    });

    const totalHargaSemua = computed(() => {
        return offtakeDetail.value.reduce((acc, item) => acc + Number(item.total || 0), 0);
    });

    const handleNextOrder = async () => {
        formOfftake.id = null;
        formOfftake.suplier = null;
        formOfftake.harga = '';
        formOfftake.keterangan = '';

        offtakeDetail.value = [];

        await fetchKodeTransaksi();
        toast.info("Siap untuk transaksi baru");
    };

    const handlePrint = async () => {
        const kode = lastCompletedOfftakeKode.value;
        if (!kode) return;

        try {
            const { url } = await offtakeService.getCetakNotaTransaksi(kode);
            window.open(url, '_blank');
        } catch (e) {
            toast.error('Gagal mencetak nota');
        }
    };

    const totalPagesProduk = computed(() => {
        const query = String(searchProdukQuery.value || '').toLowerCase();
        // PERBAIKAN: Gunakan nampanproduk.value, bukan nampan.value
        const filteredCount = (produk.value || []).filter(item => {
            return String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPageProduk) || 1;
    });

    const totalPagesOfftakeDetail = computed(() => {
        const query = String(searchOfftakeDetailQuery.value || '').toLowerCase();
        // PERBAIKAN: Gunakan nampanproduk.value, bukan nampan.value
        const filteredCount = (offtakeDetail.value || []).filter(item => {
            return String(item.produk?.nama ?? '').toLowerCase().includes(query) ||
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPageOfftakeDetail) || 1;
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

    const displayedPagesOfftakeDetail = computed(() => {
        const total = totalPagesOfftakeDetail.value;
        const current = currentPageOfftakeDetail.value; // PERBAIKAN: Gunakan currentPageNampanProduk
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
        offtake,
        suplierList,
        produk,
        TransaksiID,
        OfftakeDetail,
        isLoading,
        isLoadingProduk,
        currentPageProduk,
        currentPageOfftakeDetail,
        itemsPerPageProduk,
        itemsPerPageOfftakeDetail,
        totalPagesProduk,
        totalPagesOfftakeDetail,
        displayedPagesProduk,
        displayedPagesOfftakeDetail,
        searchProdukQuery,
        searchOfftakeDetailQuery,
        errors,
        formOfftake,
        fetchOfftakeDetail,
        fetchSuplier,
        fetchKodeTransaksi,
        filteredProduk,
        paymentOfftake,
        paginatedProduk: computed(() => {
            // PERBAIKAN: Gunakan currentPageNampanProduk.value
            const start = (currentPageProduk.value - 1) * itemsPerPageProduk;
            const query = String(searchProdukQuery.value || '').toLowerCase();

            const filtered = (produk.value || []).filter(item =>
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageProduk);
        }),
        paginatedOfftakeDetail: computed(() => {
            // PERBAIKAN: Gunakan currentPageNampanProduk.value
            const start = (currentPageOfftakeDetail.value - 1) * itemsPerPageOfftakeDetail;
            const query = String(searchOfftakeDetailQuery.value || '').toLowerCase();

            const filtered = (offtakeDetail.value || []).filter(item =>
                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageOfftakeDetail);
        }),
        filteredOfftakeDetail: computed(() => {
            const query = String(searchOfftakeDetailQuery.value || '').toLowerCase();
            return (offtakeDetail.value || []).filter(item =>

                String(item.produk?.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.produk?.nama ?? '').toLowerCase().includes(query)
            );
        }),
        handleCreate,
        handleDelete,
        handleNextOrder,
        handlePrint,
        selectedProdukIds,
        submitProduk,
        lastCompletedOfftakeKode,
        totalBerat,
        totalHargaSemua,
        totalProduk,
    }
}
