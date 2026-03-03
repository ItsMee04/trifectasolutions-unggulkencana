import { ref, computed } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { offtakeService } from '../services/offtakeService';

const offtake = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});
const selectedTransaction = ref(null);

export function useOfftake() {

    const fetchOfftake = async () => {
        isLoading.value = true;
        try {
            const response = await offtakeService.getTransaksiOfftake();
            offtake.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            offtake.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const handleView = (item) => {
        // Simpan item yang diklik ke dalam state global
        selectedTransaction.value = item;

        // Tampilkan Modal secara manual
        const modalElement = document.getElementById('offtakeviewModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // Contoh jika item adalah response dari API yang berbentuk array
    const handlePrintNota = () => {
        // Pastikan selectedTransaction ada isinya sebelum mengambil kode
        if (!selectedTransaction.value) {
            console.error("Tidak ada transaksi yang dipilih untuk dicetak");
            return;
        }

        const payload = {
            kode: selectedTransaction.value.kode,
        };

        console.log("Mencetak nota untuk kode:", payload.kode);

        // Lanjutkan ke logika cetak (misal window.print() atau hit API)
    };

    const handleBatalTransaksi = async (item) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Data Transaksi "${item.kode}" akan dibatalkan ?`,
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
                    kode: item.kode,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await offtakeService.batalTransaksi(payload);

                toast.success('Transaksi berhasil dibatal.');

                // Memanggil fetchKarat agar tabel terupdate otomatis tanpa reload
                await fetchOfftake();
            } catch (error) {
                console.error('Gagal membatalkan transaksi:', error);
                toast.error('Gagal membatalkan transaksi.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchOfftake();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = offtake.value.filter(item =>
            String(item.kode || '').toLowerCase().includes(query)
        ).length;

        return Math.ceil(filteredCount / itemsPerPage) || 1;
    });

    const displayedPages = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const maxVisible = 5; // Jumlah nomor yang ingin ditampilkan

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
        offtake,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        fetchOfftake,
        handleRefresh,
        handleView,
        handlePrintNota,
        handleBatalTransaksi,
        selectedTransaction,
        filteredOfftake: computed(() => {
            const query = searchQuery.value.toLowerCase();
            return offtake.value.filter(item =>
                String(item.kode || '').toLowerCase().includes(query)
            );
        }),
        paginatedOfftake: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (offtake.value.filter(item =>
                String(item.kode || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        })
    }
}
