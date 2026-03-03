import { ref, computed, reactive } from 'vue';
import toast from '../../../helper/toast';
import Swal from 'sweetalert2';

import { perbaikanService } from '../services/perbaikanService';

const perbaikan = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const isEdit = ref(false);
const errors = ref({});

export function usePerbaikan() {

    const fetchPerbaikan = async () => {
        isLoading.value = true;
        try {
            const response = await perbaikanService.getPerbaikan();
            perbaikan.value = Array.isArray(response) ? response : (response.data || []);
            expanded: false
        } catch (error) {
            perbaikan.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    const handleFinal = async (item) => {
        const result = await Swal.fire({
            title: 'Konfiramsi Final Perbaikan',
            text: `Data Perbaikan "${item.kode}" sudah selesai ?`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, Final!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Opsional: menukar posisi tombol Batal & Hapus
        });

        if (result.isConfirmed) {
            isLoading.value = true; // Set loading agar UI tetap konsisten [cite: 2025-10-25]
            try {
                // 📦 Siapkan Payload
                const payload = {
                    kode: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await perbaikanService.finalPerbaikan(payload);

                toast.success('Perbaikan berhasil di final.');

                // Memanggil fetchDiskon agar tabel terupdate otomatis tanpa reload
                await fetchPerbaikan();
            } catch (error) {
                console.error('Gagal memfinal data perbaikan:', error);
                toast.error('Gagal memfinal data perbaikan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Konfiramsi Batal Perbaikan?',
            text: `Data Perbaikan "${item.kode}" akan dibatalkan ? hati hati pembelian juga akan dibatalkan`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#092139',
            confirmButtonText: 'Ya, Batal!',
            cancelButtonText: 'Batal',
            reverseButtons: true // Opsional: menukar posisi tombol Batal & Hapus
        });

        if (result.isConfirmed) {
            isLoading.value = true; // Set loading agar UI tetap konsisten [cite: 2025-10-25]
            try {
                // 📦 Siapkan Payload
                const payload = {
                    kode: item.id,
                };
                // Mengirim payload id sesuai kebutuhan service Anda
                await perbaikanService.batalPerbaikan(payload);

                toast.success('Data perbaikan berhasil dibatal.');

                // Memanggil fetchDiskon agar tabel terupdate otomatis tanpa reload
                await fetchPerbaikan();
            } catch (error) {
                console.error('Gagal menghapus data perbaikan:', error);
                toast.error('Gagal menghapus data perbaikan.');
            } finally {
                isLoading.value = false;
            }
        }
    };

    const handleRefresh = async () => {
        await fetchPerbaikan();
    }

    const totalPages = computed(() => {
        const query = searchQuery.value.toLowerCase(); // Ambil string pencarian
        const filteredCount = perbaikan.value.filter(item =>
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
        perbaikan,
        isLoading,
        searchQuery,
        currentPage,
        itemsPerPage,
        totalPages,
        displayedPages,
        isEdit,
        errors,
        fetchPerbaikan,
        handleFinal,
        handleDelete,
        handleRefresh,
        filteredPerbaikan: computed(() => {
            const query = searchQuery.value.toLowerCase();
            return perbaikan.value.filter(item =>
                String(item.kode || '').toLowerCase().includes(query)
            );
        }),
        paginatedPerbaikan: computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            return (perbaikan.value.filter(item =>
                String(item.kode || '').toLowerCase().includes(searchQuery.value.toLowerCase())
            )).slice(start, start + itemsPerPage);
        })
    }
}
