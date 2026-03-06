import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pembeliandaritokoService } from '../services/pembeliandaritokoService'
import { kondisiService } from '../../../modules/kondisi/services/kondisiService'

const isLoading = ref(false);
const errors = ref({});
const lastCompletedPembelianKode = ref('');

const searchPembelianDariTokoProduk = ref('');
const currentPagePembelianDariTokoProduk = ref(1);
const itemsPerPagePembelianDariTokoProduk = 5;
const PembelianDariToko = ref([]);

// STATE TRANSAKSI
const isLoadingTransaksiPelanggan = ref(false);
const searchTransaksiPelanggan = ref('');
const currentPageTransaksiPelanggan = ref(1);
const itemsPerPageTransaksiPelanggan = 5;
const transaksiPelanggan = ref([]);

// STATE PEMBELIAN DETAIL
const isLoadingPembelianDetail = ref(false);
const searchPembelianDetail = ref('')
const currentPagePembelianDetail = ref(1);
const itemsPerPagePembelianDetail = 5;
const pembeliandetail = ref([]);

//STATE KONDISI
const kondisiList = ref([]);

const formDariToko = reactive({
    id: null,
    kode: null,
    kodetransaksi: '',
    pelanggan: '',
    pelanggan_id: null, // Untuk database (ID)
    keterangan: '',
})

const formPembelianDetail = reactive({
    id: null,
    kodeproduk: '',
    hargajual: 0,
    hargabeli: 0,
    berat: 0,
    kondisi: null,
    jenis_hargabeli: 'harga_jual'
})

export function usePembelianDariToko() {

    const validateFormCariTransaksiPelanggan = () => {
        errors.value = {}; // Reset error
        if (!formDariToko.kodetransaksi || formDariToko.kodetransaksi.trim() === '') {
            errors.value.kodetransaksi = 'Kode Transaksi tidak boleh kosong.';
        }
        return Object.keys(errors.value).length === 0;
    };

    const handleCariTransaksiPelanggan = () => {
        formDariToko.kodetransaksi = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('carikodetransaksiModal'));
        modal.show();
    };

    const fetchKodeTransaksi = async () => {
        formDariToko.kode = "Memuat data...";
        try {
            const response = await pembeliandaritokoService.getKodeTransaksi();

            // LOGIC SYNC:
            // Jika di keranjang sudah ada barang, gunakan kode dari barang tersebut
            if (PembelianDariToko.value.length > 0) {
                formDariToko.kode = PembelianDariToko.value[0].kode;
            } else {
                // Jika keranjang kosong, baru gunakan kode baru dari backend
                formDariToko.kode = response.kode;
            }
        } catch (error) {
            formDariToko.kode = "ERR-GENERATE";
        }
    };

    const submitTransaksiPelanggan = async () => {
        if (!validateFormCariTransaksiPelanggan()) return false;

        isLoadingTransaksiPelanggan.value = true;
        try {
            const payload = { kode: formDariToko.kodetransaksi };
            const response = await pembeliandaritokoService.getTransaksiByKode(payload);
            const dataRes = response.data || [];
            transaksiPelanggan.value = dataRes;

            if (dataRes.length > 0) {
                // Simpan Nama untuk UI
                formDariToko.pelanggan = dataRes[0].pelanggan?.nama || '';
                // Simpan ID untuk dikirim ke Backend nanti
                formDariToko.pelanggan_id = dataRes[0].pelanggan?.id || null;
            }

            toast.success(response.message || 'Data berhasil ditemukan');

            // Tutup Modal
            const modalElement = document.getElementById('carikodetransaksiModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data";
            toast.error(errorMessage);
        } finally {
            isLoadingTransaksiPelanggan.value = false;
        }
    };

    const handlePilihTransaksiPelanggan = async (item) => {
        const payload = {
            kode: formDariToko.kode,
            kodetransaksi: formDariToko.kodetransaksi,
            produk: item.transaksidetail?.produk_id,
            pelanggan_id: formDariToko.pelanggan_id
        }


        if (!payload.produk) {
            toast.error("ID Produk tidak ditemukan");
            return;
        }

        try {
            // 2. Kirim ke Service
            const response = await pembeliandaritokoService.storeProdukToPembelianDetail(payload);

            if (response.status) {
                toast.success(response.message);

                // 3. REFRESH TABEL UTAMA
                // Panggil fungsi untuk mengambil data keranjang terbaru
                // agar item yang baru dipilih muncul di View Parent
                if (typeof fetchPembelianDetail === 'function') {
                    await fetchPembelianDetail();
                }
            }
        } catch (error) {
            // Menampilkan pesan error dari backend (misal: "Produk sedang dalam proses transaksi aktif")
            const errorMessage = error.response?.data?.message || "Gagal menambahkan produk";
            toast.error(errorMessage);
        }
    }

    const fetchPembelianDetail = async () => {
        isLoadingPembelianDetail.value = true;
        // Sesuai instruksi: Tampilkan status memuat data
        formDariToko.pelanggan = "Memuat data...";

        try {
            const response = await pembeliandaritokoService.getPembelianDetail();
            const dataRes = Array.isArray(response) ? response : (response.data || []);
            pembeliandetail.value = dataRes;

            if (dataRes.length > 0) {
                const itemPertama = dataRes[0];

                // LOGIKASINKRONISASI NAMA PELANGGAN
                // Kita ambil dari objek pembelian -> relasi pelanggan
                if (itemPertama.pembelian && itemPertama.pembelian.pelanggan) {
                    formDariToko.pelanggan = itemPertama.pembelian.pelanggan.nama;
                    formDariToko.pelanggan_id = itemPertama.pembelian.pelanggan_id;
                } else {
                    // Jika relasi pelanggan belum di-load backend, atau pelanggan_id null
                    formDariToko.pelanggan = "Pelanggan Tidak Diketahui";
                }
            } else {
                formDariToko.pelanggan = ""; // Keranjang kosong
            }
        } catch (error) {
            console.error(error);
            formDariToko.pelanggan = "Gagal memuat data";
        } finally {
            isLoadingPembelianDetail.value = false;
            // Jika loading selesai tapi data kosong, bersihkan teks "Memuat data..."
            if (pembeliandetail.value.length === 0) {
                formDariToko.pelanggan = "";
            }
        }
    };

    const fetchKondisi = async () => {
        try {
            const response = await kondisiService.getKondisi();
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            kondisiList.value = response.data.map(kondisiList => ({
                value: kondisiList.id,
                label: kondisiList.kondisi // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Kondisi:", error);
        }
    };

    const handleEdit = async (item) => {
        errors.value = {};
        formPembelianDetail.id = item.id
        formPembelianDetail.kodeproduk = item.produk?.kodeproduk;
        formPembelianDetail.hargajual = item.kodetransaksi?.transaksidetail?.hargajual;
        const modal = new bootstrap.Modal(document.getElementById('pembeliandetaileditModal'));
        modal.show();
    }

    const handleSubmitEdit = async () => {
        // 1. Reset Errors
        errors.value = {};

        // 2. Validasi Client-Side
        let valid = true;
        const newErrors = {};

        if (!formPembelianDetail.hargabeli || formPembelianDetail.hargabeli <= 0) {
            newErrors.hargabeli = ["Harga beli harus diisi dan lebih besar dari 0."];
            valid = false;
        }

        if (formPembelianDetail.jenis_hargabeli === 'lebih_tinggi' && !formPembelianDetail.hargabeli) {
            newErrors.hargabeli = ["Silakan masukkan harga manual dengan benar."];
            valid = false;
        }

        if (!valid) {
            errors.value = newErrors;
            return; // Hentikan eksekusi jika tidak valid
        }

        // 3. Jika Valid, Jalankan Proses
        isLoadingPembelianDetail.value = true;
        try {
            // Payload disesuaikan dengan kebutuhan Controller
            const payload = {
                id: formPembelianDetail.id,
                hargabeli: formPembelianDetail.hargabeli,
                kondisi_id: formPembelianDetail.kondisi.value,
                jenis_hargabeli: formPembelianDetail.jenis_hargabeli,
            };

            const response = await pembeliandaritokoService.updatePembelianDetail(payload);

            if (response.status) {
                toast.success(response.message);

                // Tutup Modal
                const modalElement = document.getElementById('pembeliandetaileditModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();

                // Refresh tabel agar total & terbilang terbaru muncul
                await fetchPembelianDetail();
                await fetchKodeTransaksi();
            }

        } catch (err) {
            // ... (Error handling)
            toast.error(err)
        } finally {
            isLoadingPembelianDetail.value = false;
        }
    }

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data produk "${item.produk?.nama}" yang dihapus tidak dapat dikembalikan!`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const payload = {
                    id: item.id,
                };
                await pembeliandaritokoService.batalPembelianDetail(payload);
                toast.success('Data Pembelian berhasil dihapus.');
                fetchPembelianDetail();
            } catch (error) {
                console.log('Gagal menghapus data Pembelian:', error);
                toast.error(error.response?.message || 'Gagal menghapus data.');
            }
        }
    };

    const paymentPembelian = async () => {
        // Validasi dasar
        if (!formDariToko.pelanggan_id) {
            toast.error("Data pelanggan belum lengkap.");
            return;
        }

        isLoading.value = true;
        try {
            const payload = {
                kode: formDariToko.kode,
            };

            const response = await pembeliandaritokoService.paymentPembelian(payload);

            if (response.status) {
                lastCompletedPembelianKode.value = formDariToko.kode;
                // Reset form atau arahkan ke halaman cetak nota
                const modalElement = document.getElementById('paymentCompleteModal');
                if (modalElement) {
                    const modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                } else {
                    toast.success("Pembayaran Berhasil");
                }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran");
        } finally {
            isLoading.value = false;
        }
    };

    const handlePrintNota = async () => {
        // Cek apakah kode tersedia
        if (!lastCompletedPembelianKode.value) {
            toast.error("Tidak ada transaksi yang ditemukan untuk dicetak");
            return;
        }

        const payload = {
            kode: lastCompletedPembelianKode.value, // Langsung ambil nilainya
        };

        try {
            // Memanggil service cetak
            const response = await pembeliandaritokoService.CetakNotaPembelian(payload);
            if (response.url) {
                window.open(response.url, '_blank');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal mencetak nota pembelian');
        }
    };

    const handleNextOrder = async () => {
        // 1. Reset State Header/Parent
        // Kita kosongkan pelanggan tapi kode transaksi akan diisi ulang oleh fetchKodeTransaksi
        formDariToko.pelanggan = '';
        formDariToko.pelanggan_id = null;
        formDariToko.keterangan = '';

        // 2. Kosongkan State Keranjang/Detail
        pembeliandetail.value = [];

        // 3. Reset State Form Modal Edit (jika ada)
        formPembelianDetail.id = null;
        formPembelianDetail.hargabeli = 0;
        formPembelianDetail.kondisi_id = null;

        // 4. Ambil Kode Transaksi Baru (PM-xxxx) dari Backend
        // Karena status transaksi sebelumnya sudah 2 (Lunas),
        // maka backend akan otomatis men-generate kode baru.
        await fetchKodeTransaksi();

        toast.info("Siap untuk transaksi pembelian baru");
    };

    const totalPagesTransaksiPelanggan = computed(() => {
        const query = String(searchTransaksiPelanggan.value || '').toLowerCase();

        const filteredCount = (transaksiPelanggan.value || []).filter(item => {
            return String(item.transaksidetail?.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.transaksidetail?.produk?.nama || '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePembelianDariTokoProduk) || 1;
    });

    const totalPagesPembelianDariTokoProduk = computed(() => {
        const query = String(searchPembelianDariTokoProduk.value || '').toLowerCase();

        const filteredCount = (PembelianDariToko.value || []).filter(item => {
            return String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePembelianDariTokoProduk) || 1;
    });

    const totalPagesPembelianDetail = computed(() => {
        const query = String(searchPembelianDetail.value || '').toLowerCase();

        const filteredCount = (pembeliandetail.value || []).filter(item => {
            return String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePembelianDetail) || 1;
    });

    const displayedPagesTransaksiPelanggan = computed(() => {
        const total = totalPagesTransaksiPelanggan.value;
        const current = currentPageTransaksiPelanggan.value;
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

    const displayedPagesPembelianDariTokoProduk = computed(() => {
        const total = totalPagesPembelianDariTokoProduk.value;
        const current = currentPagePembelianDariTokoProduk.value;
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
        formDariToko,
        fetchKodeTransaksi,

        isLoading,
        errors,
        searchPembelianDariTokoProduk,
        currentPagePembelianDariTokoProduk,
        itemsPerPagePembelianDariTokoProduk,
        totalPagesPembelianDariTokoProduk,
        displayedPagesPembelianDariTokoProduk,

        isLoadingTransaksiPelanggan,
        searchTransaksiPelanggan,
        currentPageTransaksiPelanggan,
        itemsPerPageTransaksiPelanggan,
        totalPagesTransaksiPelanggan,
        displayedPagesTransaksiPelanggan,
        handleCariTransaksiPelanggan,
        submitTransaksiPelanggan,
        handlePilihTransaksiPelanggan,
        paginatedTransaksiPelanggan: computed(() => {
            const query = String(searchTransaksiPelanggan.value || '').toLowerCase();

            // 1. Filter dulu
            const filtered = (transaksiPelanggan.value || []).filter(item =>
                String(item.transaksidetail?.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.transaksidetail?.produk?.nama || '').toLowerCase().includes(query)
            );

            // 2. Hitung start index
            const start = (currentPageTransaksiPelanggan.value - 1) * itemsPerPageTransaksiPelanggan;

            // 3. WAJIB RETURN hasil slice
            return filtered.slice(start, start + itemsPerPageTransaksiPelanggan);
        }),

        filteredTransaksiPelanggan: computed(() => {
            const query = String(searchTransaksiPelanggan.value || '').toLowerCase();
            return (transaksiPelanggan.value || []).filter(item =>
                String(item.transaksidetail?.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.transaksidetail?.produk?.nama || '').toLowerCase().includes(query)
            );
        }),

        isLoadingPembelianDetail,
        searchPembelianDetail,
        currentPagePembelianDetail,
        itemsPerPagePembelianDetail,
        totalPagesPembelianDetail,
        displayedPagesPembelianDetail,
        fetchPembelianDetail,
        handleEdit,
        handleDelete,
        handleSubmitEdit,
        formPembelianDetail,
        kondisiList,
        fetchKondisi,
        paymentPembelian,
        handleNextOrder,
        handlePrintNota,
        paginatedPembelianDetail: computed(() => {
            const query = String(searchPembelianDetail.value || '').toLowerCase();

            // 1. Filter dulu
            const filtered = (pembeliandetail.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );

            // 2. Hitung start index
            const start = (currentPagePembelianDetail.value - 1) * itemsPerPagePembelianDetail;

            // 3. WAJIB RETURN hasil slice
            return filtered.slice(start, start + itemsPerPagePembelianDetail);
        }),

        filteredPembelianDetail: computed(() => {
            const query = String(searchPembelianDetail.value || '').toLowerCase();
            return (pembeliandetail.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );
        }),

        // PERBAIKAN: Tambahkan return dan logic slice
        paginatedPembelianDariToko: computed(() => {
            const query = String(searchPembelianDariTokoProduk.value || '').toLowerCase();

            const filtered = (PembelianDariToko.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );

            const start = (currentPagePembelianDariTokoProduk.value - 1) * itemsPerPagePembelianDariTokoProduk;

            // 3. WAJIB RETURN hasil slice
            return filtered.slice(start, start + itemsPerPagePembelianDariTokoProduk);
        }),

        filteredPembelianDariToko: computed(() => {
            const query = String(searchPembelianDariTokoProduk.value || '').toLowerCase();
            return (PembelianDariToko.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );
        }),
    }
}
