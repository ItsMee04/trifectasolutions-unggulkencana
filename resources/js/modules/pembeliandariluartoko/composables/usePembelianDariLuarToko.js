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
import { hargaService } from '../../harga/services/hargaService';

import { useSuplier } from '../../suplier/composables/useSuplier';
import { usePelanggan } from '../../pelanggan/composables/usePelanggan';

// STATE GLOBAL (SINGLETON) - Dipindah ke luar agar data tidak hilang & mencegah double fetch
const supplierOptions = ref([]);
const pelangganOptions = ref([]);
const isFetchingList = ref(false);
const PembelianDariLuarToko = ref([]);
const lastCompletedPembelianKode = ref('');

// STATE MODAL & FORM
const isEdit = ref(false);
const isLoading = ref(false);
const errors = ref({});
const jenisprodukList = ref([]);
const karatList = ref([]);
const allJenisKarat = ref([]);
const kondisiList = ref([]);
const masterHarga = ref([]);

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
    hargajual: null,
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
    const fetchOptions = async (type = formDariLuarToko.sumber, force = false) => {
        if (!type || isFetchingList.value) return;

        // Caching logic: Jika tidak dipaksa (force) dan data sudah ada, jangan hit API
        if (!force) {
            if (type === 'supplier' && supplierOptions.value.length > 0) return;
            if (type === 'pelanggan' && pelangganOptions.value.length > 0) return;
        }

        isFetchingList.value = true;
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
            // Berikan sedikit delay agar tidak terjadi spam klik/trigger
            setTimeout(() => {
                isFetchingList.value = false;
            }, 500);
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

    const handleCreateProduk = async () => {
        isEdit.value = false;
        resetFormProduk();

        // Ambil data pendukung hanya saat modal mau tampil
        await Promise.all([
            fetchJenisProduk(),
            fetchKarat(),
            fetchJenisKarat(),
            fetchKondisi(),
            fetchMasterHarga() // Ambil list harga di sini
        ]);

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
        formProduk.hargajual = null;
    };

    // Di dalam usePembelianDariLuarToko
    const fetchMasterHarga = async () => {
        // Jika data sudah ada, jangan ambil lagi
        if (masterHarga.value.length > 0) return;

        try {
            const response = await hargaService.getHarga();
            masterHarga.value = Array.isArray(response) ? response : response.data;
        } catch (error) {
            console.error("Gagal memuat master harga:", error);
        }
    };

    // Ubah fetchHargaOtomatis menjadi pencarian LOKAL
    const fetchHargaOtomatis = () => {
        if (formProduk.karat?.value && formProduk.jeniskarat?.value) {
            // Cari di variabel masterHarga (BUKAN panggil API)
            const found = masterHarga.value.find(h =>
                h.karat_id === formProduk.karat.value &&
                h.jeniskarat_id === formProduk.jeniskarat.value
            );

            if (found) {
                formProduk.harga_id = found.id;
                formProduk.harga_display = found.harga;
            } else {
                formProduk.harga_id = null;
                formProduk.harga_display = 'Harga belum diatur';
            }
        }
    };

    let debounceTimer = null;
    watch(
        () => formDariLuarToko.sumber,
        (newType) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (newType) {
                    // Saat pindah tipe (supplier <-> pelanggan), reset ID terpilih agar tidak crash
                    formDariLuarToko.selectedId = null;
                    fetchOptions(newType);
                }
            }, 300); // Tunggu 300ms
        },
        { immediate: false }
    );

    // 1. Tambahkan variabel penampung timer di atas (di luar return)
    let hargaDebounceTimer = null;

    // 2. Kembalikan Watcher Harga dengan proteksi Debounce
    watch(
        () => [formProduk.karat, formProduk.jeniskarat],
        () => {
            // Pencarian instan karena data sudah di memori
            fetchHargaOtomatis();
        },
        { deep: true }
    );

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

    const resetFormProduk = () => {
        // Reset semua field ke nilai awal
        formProduk.nama = '';
        formProduk.berat = '';
        formProduk.jenisproduk = null;
        formProduk.karat = null;
        formProduk.jeniskarat = null;
        formProduk.kondisi = null;
        formProduk.hargabeli = '';
        formProduk.harga_id = null;
        formProduk.lingkar = '';
        formProduk.panjang = '';
        formProduk.keteranganproduk = '';

        // Bersihkan error jika ada
        errors.value = {};
    };

    const handleSubmitProduk = async () => {
        if (!validateForm()) return false;
        isLoadingPembelianDetail.value = true;
        try {
            const payload = {
                kode: formDariLuarToko.kode,
                nama: formProduk.nama,
                berat: formProduk.berat,
                jenisproduk: formProduk.jenisproduk.value,
                karat: formProduk.karat.value,
                jeniskarat: formProduk.jeniskarat.value,
                kondisi: formProduk.kondisi.value,
                hargabeli: formProduk.hargabeli,
                hargajual: formProduk.harga_id,
                lingkar: formProduk.lingkar,
                panjang: formProduk.panjang,
                keterangan: formProduk.keteranganproduk
            }

            let response;
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formProduk.id;
                response = await pembeliandariluartokoService.updatePembelianDetail(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await pembeliandariluartokoService.storeProdukToPembelianDetail(payload);
            }

            if (response.status) {
                toast.success(response.message);

                // Tutup Modal
                const modalElement = document.getElementById('produkModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();

                // 2. RESET FORM DI SINI
                resetFormProduk();

                // Refresh tabel agar total & terbilang terbaru muncul
                await fetchPembelianDetail();
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Gagal menyimpan transaksi";
            toast.error(errorMessage);

            // Opsional: Jika ingin menampilkan error validasi field secara detail
            if (error.response?.status === 400 && error.response.data.errors) {
                errors.value = error.response.data.errors;
            }
        } finally {
            isLoadingPembelianDetail.value = false;
        }
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

    const handleEdit = async (item) => {
        isEdit.value = true;
        errors.value = {};

        // Ambil data produk dari item
        const produk = item.produk;

        // Data teks/angka biasa
        formProduk.id = item.id;
        formProduk.nama = produk.nama;
        formProduk.berat = produk.berat;
        formProduk.hargabeli = item.hargabeli;
        formProduk.lingkar = produk.lingkar;
        formProduk.panjang = produk.panjang;
        formProduk.keteranganproduk = produk.keterangan;
        formProduk.harga_id = produk.harga_id;

        // --- PERBAIKAN MULTISELECT ---

        // 1. Jenis Produk
        // Cari di jenisprodukList berdasarkan id yang ada di produk
        const foundJenis = jenisprodukList.value.find(jp => jp.value === produk.jenisproduk_id);
        formProduk.jenisproduk = foundJenis ? foundJenis : null;

        // 2. Karat
        const foundKarat = karatList.value.find(k => k.value === produk.karat_id);
        formProduk.karat = foundKarat ? foundKarat : null;

        // 3. Jenis Karat
        // Karena Jenis Karat bergantung pada Karat, kita pastikan allJenisKarat sudah terisi
        const foundJenisKarat = allJenisKarat.value
            .filter(jk => jk.karat_id === produk.karat_id)
            .find(jk => jk.id === produk.jeniskarat_id);

        formProduk.jeniskarat = foundJenisKarat ? { value: foundJenisKarat.id, label: foundJenisKarat.jenis } : null;

        // 4. Kondisi
        const foundKondisi = kondisiList.value.find(kon => kon.value === item.kondisi_id);
        formProduk.kondisi = foundKondisi ? foundKondisi : null;

        // Tampilkan Modal
        const modal = new bootstrap.Modal(document.getElementById('produkModal'));
        modal.show();
    };

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
                await pembeliandariluartokoService.batalPembelianDetail(payload);
                toast.success('Data Pembelian berhasil dihapus.');
                fetchPembelianDetail();
                fetchKodeTransaksi();
            } catch (error) {
                console.log('Gagal menghapus data Pembelian:', error);
                toast.error(error.response?.message || 'Gagal menghapus data.');
            }
        }
    };

    const paymentPembelian = async () => {
        // 1. Validasi: Pastikan ID Supplier/Pelanggan sudah dipilih
        if (!formDariLuarToko.selectedId) {
            const tipe = formDariLuarToko.sumber === 'supplier' ? "Suplier" : "Pelanggan";
            toast.error(`Silakan pilih ${tipe} terlebih dahulu sebelum bayar.`);
            return;
        }

        // 2. Validasi: Pastikan ada barang di tabel (keranjang)
        if (pembeliandetail.value.length === 0) {
            toast.error("Keranjang masih kosong. Tambahkan produk terlebih dahulu.");
            return;
        }

        isLoading.value = true;
        try {
            // --- PERBAIKAN DI SINI ---
            // Kita ekstrak ID-nya saja. Jika terpilih objek, ambil .value-nya.
            const actualId = formDariLuarToko.selectedId?.value || formDariLuarToko.selectedId;

            // 3. Siapkan Payload untuk Backend
            const payload = {
                kode: formDariLuarToko.kode,
                sumber: formDariLuarToko.sumber,
                selectedId: actualId, // Sekarang bernilai integer (misal: 1)
                keterangan: formDariLuarToko.keterangan
            };
            // -------------------------

            const response = await pembeliandariluartokoService.paymentPembelian(payload);

            if (response.status) {
                lastCompletedPembelianKode.value = formDariLuarToko.kode;
                toast.success("Transaksi Berhasil Disimpan!");

                // 4. Reset Form & Refresh State
                formDariLuarToko.selectedId = null;
                formDariLuarToko.keterangan = '';

                // Generate Kode Baru & Bersihkan Tabel
                await fetchKodeTransaksi();
                await fetchPembelianDetail();

                // 5. Trigger Modal Selesai
                const modalElement = document.getElementById('paymentCompleteModal');
                if (modalElement) {
                    const modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                }
            }
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran");
        } finally {
            isLoading.value = false;
        }
    };

    // Contoh jika item adalah response dari API yang berbentuk array
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
            const response = await pembeliandariluartokoService.CetakNotaPembelian(payload);
            if (response.url) {
                window.open(response.url, '_blank');
            }
        } catch (e) {
            console.error(e);
            toast.error('Gagal mencetak nota pembelian');
        }
    };

    const handleNextOrder = async () => {
        await fetchKodeTransaksi();
        toast.info("Siap untuk transaksi pembelian baru");
    };

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
        handleEdit,
        handleDelete,
        paymentPembelian,
        handlePrintNota,
        handleNextOrder,
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
