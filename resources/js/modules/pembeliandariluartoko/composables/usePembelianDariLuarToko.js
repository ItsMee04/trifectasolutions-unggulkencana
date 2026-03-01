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

const PembelianDariLuarToko = ref([]);
const isFetchingList = ref(false);
const supplierOptions = ref([]);
const pelangganOptions = ref([]);

// STATE MODAL
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
    sumber: 'supplier',
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

            // LOGIC SYNC:
            // Jika di keranjang sudah ada barang, gunakan kode dari barang tersebut
            if (PembelianDariLuarToko.value.length > 0) {
                formDariLuarToko.kode = PembelianDariLuarToko.value[0].kode;
            } else {
                // Jika keranjang kosong, baru gunakan kode baru dari backend
                formDariLuarToko.kode = response.kode;
            }
        } catch (error) {
            formDariLuarToko.kode = "ERR-GENERATE";
        }
    };

    const fetchOptions = async (type) => {
        isFetchingList.value = true;
        formDariLuarToko.selectedId = null; // BENAR: Tanpa .value

        try {
            if (type === 'supplier') {
                const response = await suplierService.getSuplier();
                supplierOptions.value = response.data.map(supplierOptions => ({
                    value: supplierOptions.id,
                    label: supplierOptions.nama // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
                }));
            } else {
                const response = await pelangganService.getPelanggan();
                pelangganOptions.value = response.data.map(pelangganOptions => ({
                    value: pelangganOptions.id,
                    label: pelangganOptions.nama // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
                }));
            }
        } catch (error) {
            console.error("Gagal ambil list:", error);
        } finally {
            isFetchingList.value = false;
        }
    };

    // LOGIC OTOMATIS: Tanpa ubah komponen lain
    const handleModalClosed = (event) => {
        // Jika modal yang ditutup adalah modal suplier atau pelanggan
        // Kita trigger fetch ulang agar data terbaru masuk
        fetchOptions(formDariLuarToko.sumber);
    };

    onMounted(() => {
        // Listen ke event global 'hidden.bs.modal' milik Bootstrap
        // Event ini terpicu otomatis setiap kali modal APAPUN ditutup
        document.addEventListener('hidden.bs.modal', handleModalClosed);
    });

    onUnmounted(() => {
        document.removeEventListener('hidden.bs.modal', handleModalClosed);
    });

    const handleCreateSuplier = async () => {
        openSuplierModal();
        await fetchOptions('supplier');
    }

    const handleCreatePelanggan = async () => {
        openPelangganModal();
        await fetchOptions('pelanggan');
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
            // Map data agar formatnya { value: id, label: 'nama' } sesuai standar Multiselect
            jenisprodukList.value = response.data.map(jenisprodukList => ({
                value: jenisprodukList.id,
                label: jenisprodukList.jenis // Sesuaikan field 'role' dengan nama kolom di tabel roles Anda
            }));
        } catch (error) {
            console.error("Gagal memuat Jenis Produk:", error);
        }
    };

    const fetchKarat = async () => {
        try {
            const response = await karatService.getKarat();
            karatList.value = response.data.map(karatList => ({
                value: karatList.id,
                label: karatList.karat,
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

    // LOGIKA FILTER BERTINGKAT (Computed)
    const filteredJenisKaratList = computed(() => {
        if (!formProduk.karat || !formProduk.karat.value) return [];

        return allJenisKarat.value
            .filter(item => item.karat_id === formProduk.karat.value)
            .map(item => ({
                value: item.id,
                label: item.jenis
            }));
    });

    // Reset Jenis Karat jika Karat diubah
    const handleKaratChange = () => {
        formProduk.jeniskarat = null;
    };

    watch(
        () => formDariLuarToko.sumber,
        (newType) => {
            if (newType) {
                fetchOptions(newType);
            }
        },
        { immediate: true }
    );

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

    const validateForm = () => {
        errors.value = {};
        if (!formProduk.nama || formProduk.nama.trim() === '') {
            errors.value.nama = 'Nama tidak boleh kosong.';
        }

        if (!formProduk.berat || String(formProduk.berat).trim() === '') {
            errors.value.berat = 'Berat tidak boleh kosong.';
        } else {
            // Regex untuk memastikan hanya angka dan titik, bukan koma
            const beratRegex = /^\d+(\.\d+)?$/;

            if (String(formProduk.berat).includes(',')) {
                errors.value.berat = 'Gunakan titik (.) sebagai pemisah desimal, bukan koma.';
            } else if (!beratRegex.test(formProduk.berat)) {
                errors.value.berat = 'Format berat tidak valid (contoh: 10.5).';
            }
        }

        if (!formProduk.jenisproduk || formProduk.jenisproduk === null) {
            errors.value.jenisproduk = 'Jenis Produk wajib dipilih.';
        } else if (Array.isArray(formProduk.jenisproduk) && formProduk.jenisproduk.length === 0) {
            errors.value.jenisproduk = 'Pilih satu Jenis Produk.';
        }

        if (!formProduk.karat || formProduk.karat === null) {
            errors.value.karat = 'Karat wajib dipilih.';
        } else if (Array.isArray(formProduk.karat) && formProduk.karat.length === 0) {
            errors.value.karat = 'Pilih satu karat.';
        }

        if (!formProduk.jeniskarat || formProduk.jeniskarat === null) {
            errors.value.jeniskarat = 'Jenis Karat wajib dipilih.';
        } else if (Array.isArray(formProduk.jeniskarat) && formProduk.jeniskarat.length === 0) {
            errors.value.jeniskarat = 'Pilih satu jenis karat.';
        }

        if (!formProduk.kondisi || formProduk.kondisi === null) {
            errors.value.kondisi = 'Jenis Produk wajib dipilih.';
        } else if (Array.isArray(formProduk.kondisi) && formProduk.kondisi.length === 0) {
            errors.value.kondisi = 'Pilih satu Jenis Produk.';
        }

        // VALIDASI HARGA BELI
        if (!formProduk.hargabeli || String(formProduk.hargabeli).trim() === '') {
            errors.value.hargabeli = 'Harga beli tidak boleh kosong.';
        } else {
            // Regex untuk memastikan hanya angka (integer)
            // Jika ingin mendukung desimal, gunakan: /^\d+(\.\d+)?$/
            const hargaRegex = /^\d+$/;

            if (!hargaRegex.test(formProduk.hargabeli)) {
                errors.value.hargabeli = 'Harga beli harus berupa angka tanpa simbol atau pemisah.';
            }
        }

        return Object.keys(errors.value).length === 0;
    };

    const resetForm = () => {
        formProduk.id = null;
        formProduk.nama = '';
        formProduk.berat = '';
        formProduk.jenisproduk = null;
        formProduk.karat = null;
        formProduk.jeniskarat = null;
        formProduk.hargabeli = '';
        formProduk.lingkar = '';
        formProduk.panjang = '';
        formProduk.keterangan = '';
        errors.value = {};
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

        // let response;
        // if (isEdit.value) {
        //     // Jika Edit, tetap gunakan POST karena FormData tidak stabil di PUT pada beberapa server
        //     response = await produkService.updateProduk(payload);
        // } else {
        //     response = await produkService.storeProduk(payload);
        // }



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

    const handleSubmitEdit = async () => {
        // 1. Reset Errors
        // errors.value = {};

        // // 2. Validasi Client-Side
        // let valid = true;
        // const newErrors = {};

        // if (!formPembelianDetail.hargabeli || formPembelianDetail.hargabeli <= 0) {
        //     newErrors.hargabeli = ["Harga beli harus diisi dan lebih besar dari 0."];
        //     valid = false;
        // }

        // if (formPembelianDetail.jenis_hargabeli === 'lebih_tinggi' && !formPembelianDetail.hargabeli) {
        //     newErrors.hargabeli = ["Silakan masukkan harga manual dengan benar."];
        //     valid = false;
        // }

        // if (!valid) {
        //     errors.value = newErrors;
        //     return; // Hentikan eksekusi jika tidak valid
        // }

        // // 3. Jika Valid, Jalankan Proses
        // isLoadingPembelianDetail.value = true;
        // try {
        //     // Payload disesuaikan dengan kebutuhan Controller
        //     const payload = {
        //         id: formPembelianDetail.id,
        //         hargabeli: formPembelianDetail.hargabeli,
        //         kondisi_id: formPembelianDetail.kondisi.valid,
        //         jenis_hargabeli: formPembelianDetail.jenis_hargabeli,
        //         keterangan: formPembelianDetail.keterangan
        //     };

        //     const response = await pembeliandaritokoService.updatePembelianDetail(payload);

        //     if (response.status) {
        //         toast.success(response.message);

        //         // Tutup Modal
        //         const modalElement = document.getElementById('pembeliandetaileditModal');
        //         const modalInstance = bootstrap.Modal.getInstance(modalElement);
        //         if (modalInstance) modalInstance.hide();

        //         // Refresh tabel agar total & terbilang terbaru muncul
        //         await fetchPembelianDetail();
        //     }

        // } catch (err) {
        //     // ... (Error handling)
        // } finally {
        //     isLoadingPembelianDetail.value = false;
        // }
    }

    const handleDelete = async (item) => {
        // const result = await Swal.fire({
        //     title: 'Apakah Anda yakin?',
        //     text: `Data produk "${item.produk?.nama}" yang dihapus tidak dapat dikembalikan!`,
        //     showCancelButton: true,
        //     confirmButtonColor: '#3085d6',
        //     cancelButtonColor: '#092139',
        //     confirmButtonText: 'Ya, hapus!',
        //     cancelButtonText: 'Batal',
        //     reverseButtons: true
        // });

        // if (result.isConfirmed) {
        //     try {
        //         const payload = {
        //             id: item.id,
        //         };
        //         await pembeliandaritokoService.batalPembelianDetail(payload);
        //         toast.success('Data Pembelian berhasil dihapus.');
        //         fetchPembelianDetail();
        //     } catch (error) {
        //         console.log('Gagal menghapus data Pembelian:', error);
        //         toast.error(error.response?.message || 'Gagal menghapus data.');
        //     }
        // }
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
        // Pastikan variabel-variabel ini ada di sini!
        errors,
        PembelianDariLuarToko,
        isFetchingList,
        supplierOptions,
        pelangganOptions,
        formDariLuarToko,
        fetchKodeTransaksi,
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
        // handleEdit,
        // handleDelete,
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
    };
}
