import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { pembeliandariluartokoService } from '../services/pembeliandariluartokoService'
import { suplierService } from '../../../modules/suplier/services/suplierService'
import { pelangganService } from '../../../modules/pelanggan/services/pelangganService'

import { useSuplier } from '../../suplier/composables/useSuplier';
import { usePelanggan } from '../../pelanggan/composables/usePelanggan';

const isEdit = ref (false);
const isLoading = ref(false);
const PembelianDariLuarToko = ref([]);
const isFetchingList = ref(false);
const errors = ref({});
const supplierOptions = ref([]);
const pelangganOptions = ref([]);

const formDariLuarToko = reactive({
    kode: '',
    sumber: 'supplier',
    selectedId: null,
    keterangan: ''
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

    watch(
        () => formDariLuarToko.sumber,
        (newType) => {
            if (newType) {
                fetchOptions(newType);
            }
        },
        { immediate: true }
    );

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
    };
}
