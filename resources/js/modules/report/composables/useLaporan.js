import { ref, onMounted, reactive } from "vue";
import toast from '../../../helper/toast'
import { laporanService } from "../services/laporanService";

const errors = ref('')
const formLaporan = reactive({
    tanggaldari: '',
    tanggalsampai: ''
});

export function useLaporan() {

    const validateForm = () => {
        errors.value = {}; // Reset error

        // 2. Validasi Tanggal (Wajib diisi)
        if (!formLaporan.tanggaldari) {
            errors.value.tanggaldari = 'Periode Dari harus dipilih.';
            toast.error('Periode Dari harus dipilih.')
        }

        if (!formLaporan.tanggalsampai) {
            errors.value.tanggalsampai = 'Periode Sampai harus dipilih.';
            toast.error('Periode Sampai harus dipilih.')
        }

        return Object.keys(errors.value).length === 0;
    };

    const cetakLaporanPenjualan = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanPenjualan(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan penjualan')
        }
    }

    const cetakLaporanPembelian = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanPembelian(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan pembelian')
        }
    }

    const cetakLaporanOfftake = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanOfftake(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan offtake')
        }
    }

    const cetakLaporanPerbaikan = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanPerbaikan(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan perbaikan')
        }
    }

    const cetakLaporanStokBulanan = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanStokBulanan(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan stok bulanan')
        }
    }

    const cetakLaporanMutasiSaldo = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanMutasiSaldo(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan mutasi saldo')
        }
    }

    const cetakLaporanNampan = async () => {
        if (!validateForm()) return false;

        const payload = {
            periodedari: formLaporan.tanggaldari,
            periodesampai: formLaporan.tanggalsampai
        }

        try {
            const { url } = await laporanService.cetakLaporanNampan(payload)
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan nampan')
        }
    }

    const cetakLaporanProduk = async () => {

        try {
            const { url } = await laporanService.cetakLaporanProduk()
            window.open(url, '_blank')
        } catch (e) {
            console.log(e)
            toast.error('Gagal mencetak laporan produk')
        }
    }

    return {
        errors,
        formLaporan,
        cetakLaporanPenjualan,
        cetakLaporanPembelian,
        cetakLaporanOfftake,
        cetakLaporanPerbaikan,
        cetakLaporanStokBulanan,
        cetakLaporanMutasiSaldo,
        cetakLaporanNampan,
        cetakLaporanProduk,
    }
}
