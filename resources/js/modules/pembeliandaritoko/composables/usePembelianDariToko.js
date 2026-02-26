import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pembeliandaritokoService } from '../services/pembeliandaritokoService'

const isLoading = ref(false);
const errors = ref({});
const searchPembelianDariTokoProduk = ref('');
const currentPagePembelianDariTokoProduk = ref(1);
const itemsPerPagePembelianDariTokoProduk = 5;

const PembelianDariToko = ref([]);

const formDariToko = reactive({
    id: null,
    kode: null,
    kodetransaksi: '',
    pelanggan: '',
    keterangan: '',
})

export function usePembelianDariToko() {

    const handleCariKodeTransaksi = () => {
        formDariToko.kodetransaksi = '';
        errors.value = {};
        const modal = new bootstrap.Modal(document.getElementById('carikodetransaksiModal'));
        modal.show();
    };

    const submitCariKodeTransaksi = async () => {
        if (!validateForm()) return false;

        isLoading.value = true;
        try {
            // 📦 Siapkan Payload
            const payload = {
                kode: formDariToko.kodetransaksi
            };

            let response;
            response = await pembeliandaritokoService.storeJabatan(payload);
            if (isEdit.value) {
                // Mode Edit: Kirim ID dan Payload
                payload.id = formJabatan.id;
                response = await jabatanService.updateJabatan(payload);
            } else {
                // Mode Tambah: Kirim Payload saja
                response = await jabatanService.storeJabatan(payload);
            }

            toast.success(response.message || 'Data berhasil disimpan');

            // Tutup Modal
            const modalElement = document.getElementById('jabatanModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            // Refresh tabel tanpa reload halaman [cite: 2025-10-25]
            await fetchJabatan();

            return true;
        } catch (error) {
            if (error.response?.status === 422) {
                // 1. Simpan error untuk ditampilkan di bawah input field
                errors.value = error.response.data.errors;

                // 2. ✨ TAMBAHKAN INI: Munculkan notify agar user tahu ada yang salah
                const firstErrorMessage = error.response.data.message || 'Terjadi kesalahan validasi.';
                toast.error(firstErrorMessage);
            } else {
                // Untuk error server (500), koneksi, dsb.
                toast.error(error.response?.message || 'Gagal menyimpan data.');
            }
            return false;
        } finally {
            isLoading.value = false;
        }
    };

    const totalPagesPembelianDariTokoProduk = computed(() => {
        const query = String(searchPembelianDariTokoProduk.value || '').toLowerCase();

        const filteredCount = (PembelianDariToko.value || []).filter(item => {
            return String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPagePembelianDariTokoProduk) || 1;
    });

    const displayedPagesPembelianDariTokoProduk = computed(() => {
        const total         = totalPagesPembelianDariTokoProduk.value;
        const current       = currentPagePembelianDariTokoProduk.value;
        const maxVisible    = 5;

        let start   = Math.max(current - Math.floor(maxVisible / 2), 1);
        let end     = start + maxVisible - 1;
        if(end > total){
            end     = total;
            start   = Math.max(end - maxVisible + 1, 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) { pages.push(i)}
        return pages;
    })

    return {
        formDariToko,

        isLoading,
        errors,
        searchPembelianDariTokoProduk,
        currentPagePembelianDariTokoProduk,
        itemsPerPagePembelianDariTokoProduk,
        totalPagesPembelianDariTokoProduk,
        displayedPagesPembelianDariTokoProduk,

        handleCariKodeTransaksi,
        paginatedPembelianDariToko: computed(() => {
            const start = (currentPagePembelianDariTokoProduk.value - 1) + itemsPerPagePembelianDariTokoProduk;
            const query = String(searchPembelianDariTokoProduk.value || '').toLowerCase();

            const filtered = (PembelianDariToko.value || []).filter(item =>
                String(item.produk?.kodeproduk || '').toLowerCase().includes(query) ||
                String(item.produk?.nama || '').toLowerCase().includes(query)
            );
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
