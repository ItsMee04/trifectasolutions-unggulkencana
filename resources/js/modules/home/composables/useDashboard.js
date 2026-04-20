import { ref } from "vue";
import { homeService } from '../services/homeService';

// STATE GLOBAL (Di luar function agar data menetap)
const chartLabels = ref([]);
const chartSales = ref([]);
const chartPurchases = ref([]);
const isLoadingChart = ref(false);

const hargaEmas = ref([])
const produkPerbaikan = ref([])

export function useHome() {
    // 1. Refs untuk tampilan animasi
    const displaySaldo = ref(0);
    const displaySaldoKeluar = ref(0);
    const displayTotalPenjualanMasuk = ref(0);
    const displayTotalPenjualanKeluar = ref(0);
    const displayTotalPelanggan = ref(0);
    const displayTotalSuplier = ref(0);
    const displayTotalTransaksi = ref(0);
    const displayTotalPembelian = ref(0)

    const isLoading = ref(false);

    // 2. Fungsi Animasi Reusable
    const animateValue = (targetRef, start, end, duration = 1500) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            targetRef.value = Math.floor(progress * (end - start) + start);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // 3. Fungsi Fetch Utama (Berjalan Bersamaan)
    const fetchDashboardData = async () => {
        isLoading.value = true;
        try {
            // Menjalankan semua API secara paralel
            const [
                resMasuk,
                resKeluar,
                resJualMasuk,
                resJualKeluar,
                resPelanggan,
                resSuplier,
                resTotalTransaksi,
                resTotalPembelian,
            ] = await Promise.all([
                homeService.getTotalSaldoMasuk(),
                homeService.getTotalSaldoKeluar(),
                homeService.getTotalPenjualanMasuk(),
                homeService.getTotalPenjualanKeluar(),
                homeService.getTotalPelanggan(),
                homeService.getTotalSuplier(),
                homeService.getTotalPenjualan(),
                homeService.getTotalPembelian(),
            ]);

            // Ekstrak nilai (asumsi response.data berisi angka)
            const data = {
                masuk: Number(resMasuk?.data || 0),
                keluar: Number(resKeluar?.data || 0),
                jualMasuk: Number(resJualMasuk?.data || 0),
                jualKeluar: Number(resJualKeluar?.data || 0),
                pelanggan: Number(resPelanggan?.data || 0),
                suplier: Number(resSuplier?.data || 0),
                penjualan: Number(resTotalTransaksi?.data || 0),
                pembelian: Number(resTotalPembelian?.data || 0),
            };

            // Jalankan semua animasi di waktu yang sama
            animateValue(displaySaldo, 0, data.masuk);
            animateValue(displaySaldoKeluar, 0, data.keluar);
            animateValue(displayTotalPenjualanMasuk, 0, data.jualMasuk);
            animateValue(displayTotalPenjualanKeluar, 0, data.jualKeluar);
            animateValue(displayTotalPelanggan, 0, data.pelanggan);
            animateValue(displayTotalSuplier, 0, data.suplier);
            animateValue(displayTotalTransaksi, 0, data.penjualan);
            animateValue(displayTotalPembelian, 0, data.pembelian);

        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchChartData = async () => {
        // if (chartLabels.value.length > 0 && !force) return;
        isLoadingChart.value = true;
        try {
            const [resSales, resPurchases] = await Promise.all([
                homeService.getSalesChart(),
                homeService.getSalesChartPembelian()
            ]);

            // SESUAIKAN DENGAN STRUKTUR JSON ANDA: res.data
            if (resSales?.success) {
                chartLabels.value = resSales.data.labels || [];
                chartSales.value = (resSales.data.sales || []).map(Number);
            }
            if (resPurchases?.success) {
                chartPurchases.value = (resPurchases.data.sales || []).map(Number);
            }
        } catch (error) {
            console.error("Gagal ambil data chart:", error);
        } finally {
            isLoadingChart.value = false;
        }
    };

    const fetchHargaEmas = async () => {
        isLoading.value = true; // Set loading agar UI memberikan feedback
        try {
            const response = await homeService.getHargaEmas();
            if (response.success) {
                // PERBAIKAN: Langsung ke hargaEmas.value, bukan state.hargaEmas
                hargaEmas.value = response.data;
            }
        } catch (error) {
            console.error("Gagal memuat harga emas:", error);
        } finally {
            isLoading.value = false;
        }
    }

    const fetchProdukPerbaikan = async () => {
        isLoading.value = true; // Set loading agar UI memberikan feedback
        try {
            const response = await homeService.getProdukPerbaikan();
            if (response.success) {
                // PERBAIKAN: Langsung ke hargaEmas.value, bukan state.hargaEmas
                produkPerbaikan.value = response.data;
            }
        } catch (error) {
            console.error("Gagal memuat harga emas:", error);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        displaySaldo,
        displaySaldoKeluar,
        displayTotalPenjualanMasuk,
        displayTotalPenjualanKeluar,
        displayTotalPelanggan,
        displayTotalSuplier,
        displayTotalTransaksi,
        displayTotalPembelian,
        isLoading,
        hargaEmas,
        produkPerbaikan,
        fetchDashboardData,
        chartLabels,
        chartSales,
        chartPurchases,
        isLoadingChart,
        fetchDashboardData,
        fetchChartData,
        fetchHargaEmas,
        fetchProdukPerbaikan,
    };
}
