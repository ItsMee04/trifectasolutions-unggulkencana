import { ref, computed, reactive, watch } from 'vue';
import toast from '../../../helper/toast'
import Swal from 'sweetalert2';
import { STORAGE_URL } from '../../../helper/base';


import { jenisprodukService } from '../../../modules/jenisproduk/services/jenisprodukService'
import { nampanprodukService } from '../../nampanproduk/services/nampanprodukService'
import { pelangganService } from '../../../modules/pelanggan/services/pelangganService'
import { diskonService } from '../../../modules/diskon/services/diskonService'
import { transaksiService } from '../../../modules/transaksi/services/transaksiService'
import { usePelanggan } from '../../../modules/pelanggan/composables/usePelanggan';

const jenisprodukList = ref([]);
const selectedJenisProduk = ref('all');
const produk = ref([]);
const PelangganList = ref([]);
const DiskonList = ref([]);
const TransaksiID = ref('');
const selectedDiskon = ref(null);
const TransaksiDetail = ref([]);
const lastCompletedTransactionId = ref('');
const isLoading = ref(false);
const isLoadingProduk = ref(false);
const searchProdukQuery = ref('');
const currentPageProduk = ref(1);
const itemsPerPageProduk = 8;
const usePoint = ref(false);
const inputPoint = ref(0);
const errors = ref({});
const scanQuery = ref('');

const formPOS = reactive({
    id: null,
    pelanggan: null,
    diskon: null,
});

export function usePOS() {

    const { handleKirimPesanForm } = usePelanggan();

    const fetchJenisProduk = async () => {
        isLoading.value = true;
        try {
            const response = await jenisprodukService.getJenisProduk();
            const mappedData = response.data.map(item => ({
                id: item.id,
                jenis: item.jenis,
                value: item.id,
                label: item.jenis
            }));

            jenisprodukList.value = [
                { id: 'all', jenis: 'SEMUA', value: 'all', label: 'SEMUA' },
                ...mappedData
            ];
        } catch (error) {
            console.error("Gagal memuat Jenis Produk:", error);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchProduk = async (jenisId = 'all') => {
        isLoadingProduk.value = true;
        try {
            const payload = {
                jenis: jenisId,
            }
            const response = await nampanprodukService.getProdukInNampanByJenis(payload);
            produk.value = response.data || [];
        } catch (error) {
            produk.value = [];
            console.error("Gagal memuat produk:", error);
        } finally {
            isLoadingProduk.value = false;
        }
    };

    const handlePilihProduk = async (kodeproduk) => {
        // 1. Validasi awal: Pastikan Kode Transaksi sudah siap
        if (!TransaksiID.value || TransaksiID.value.includes("Memuat")) {
            toast.error("Tunggu kode transaksi selesai dimuat");
            return;
        }

        // 2. Cari detail produk dari state produk local (hasil fetch produk)
        const detailProduk = produk.value.find(p => p.kodeproduk === kodeproduk);

        if (detailProduk) {
            isLoading.value = true; // Aktifkan loading state jika ada

            try {
                // 3. Susun Payload dengan menggabungkan detailProduk + Kode Transaksi
                const payload = {
                    ...detailProduk,
                    kode: TransaksiID.value // Menambahkan kode TR-xxxx
                };

                // 4. Kirim ke Service Backend
                const response = await transaksiService.storeProdukToTransaksiDetail(payload);

                if (response.data.status) {
                    toast.success(response.data.message || `Produk ${detailProduk.nama} berhasil ditambahkan`);

                    // 5. Next Step: Panggil fungsi fetch data keranjang untuk update UI tabel
                    // await fetchCartDetails();
                }

                await fetchTransaksiDetail()
            } catch (error) {
                // 6. Handling Error (Misal: produk sudah ada atau server error)
                const errorMsg = error.response?.data?.message || "Gagal menambahkan produk ke keranjang";
                toast.error(errorMsg);
                console.error("Error Store Detail:", error);
            } finally {
                isLoading.value = false;
            }
        } else {
            toast.error("Data produk tidak ditemukan");
        }
    };

    const fetchKodeTransaksi = async () => {
        TransaksiID.value = "Memuat data...";
        try {
            const response = await transaksiService.getKodeTransaksi();

            // LOGIC SYNC:
            // Jika di keranjang sudah ada barang, gunakan kode dari barang tersebut
            if (TransaksiDetail.value.length > 0) {
                TransaksiID.value = TransaksiDetail.value[0].kode;
            } else {
                // Jika keranjang kosong, baru gunakan kode baru dari backend
                TransaksiID.value = response.kode;
            }
        } catch (error) {
            TransaksiID.value = "ERR-GENERATE";
        }
    };

    const fetchPelanggan = async () => {
        try {
            const response = await pelangganService.getPelanggan();
            PelangganList.value = response.data.map(p => {
                const totalPoin = p.poin ? p.poin.reduce((sum, item) => sum + parseInt(item.jumlah), 0) : 0;

                return {
                    value: p.id,
                    label: p.nama,
                    point: totalPoin,
                    kontak: p.kontak // Menggunakan properti 'kontak' dari JSON Anda
                };
            });
        } catch (error) {
            toast.error("Gagal memuat Pelanggan");
        }
    };

    // Watcher untuk memantau perubahan pelanggan dan mengatur opsi point
    watch(() => formPOS.pelanggan, (newPelanggan) => {
        usePoint.value = false;
        inputPoint.value = 0;
    });

    const fetchDiskon = async () => {
        try {
            const response = await diskonService.getDiskon();
            DiskonList.value = response.data.map(DiskonList => ({
                value: DiskonList.id,
                label: DiskonList.diskon,
                nilai: DiskonList.nilai
            }));
        } catch (error) {
            toast.error("Gagal memuat Diskon:", error);
        }
    };

    const selectedDiskonNilai = computed(() => {
        return selectedDiskon.value ? selectedDiskon.value.nilai : 0;
    });

    const fetchTransaksiDetail = async () => {
        isLoading.value = true;
        try {
            const response = await transaksiService.getTransaksiDetail();
            TransaksiDetail.value = Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            TransaksiDetail.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // Di dalam export function usePOS()
    const handleBarcodeScan = async () => {
        const barcode = scanQuery.value.trim();

        if (barcode) {
            // 1. Validasi awal: Pastikan Kode Transaksi sudah siap
            if (!TransaksiID.value || TransaksiID.value.includes("Memuat")) {
                toast.error("Tunggu kode transaksi selesai dimuat");
                scanQuery.value = '';
                return;
            }

            // 2. Cari detail produk dari state produk local (seperti handlePilihProduk)
            const detailProduk = produk.value.find(p => p.kodeproduk === barcode);

            if (detailProduk) {
                isLoading.value = true;
                try {
                    // 3. Susun Payload (sama dengan standar backend Anda)
                    const payload = {
                        kode: TransaksiID.value,
                        kodeproduk: detailProduk.kodeproduk,
                        harga: detailProduk.harga,
                        berat: detailProduk.berat,
                        karat: detailProduk.karat,
                        lingkar: detailProduk.lingkar ?? 0,
                        panjang: detailProduk.panjang ?? 0
                    };

                    // 4. Kirim ke Backend (Route yang sama)
                    const response = await transaksiService.storeProdukToTransaksiDetail(payload);

                    if (response.data.status) {
                        toast.success(`Berhasil: ${detailProduk.nama}`);

                        // 5. Update UI: Refresh tabel keranjang
                        await fetchTransaksiDetail();
                    }
                } catch (error) {
                    const errorMsg = error.response?.data?.message || "Gagal memproses barcode";
                    toast.error(errorMsg);
                    console.error("Scan Error:", error);
                } finally {
                    isLoading.value = false;
                    scanQuery.value = ''; // Reset input field
                }
            } else {
                // Jika barcode tidak ada di daftar produk lokal
                toast.error(`Barcode ${barcode} tidak terdaftar atau stok kosong`);
                scanQuery.value = '';
            }
        }
    };

    // 2. Fungsi Hapus Item dari Keranjang
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Hapus Item?',
            text: "Produk akan dikeluarkan dari daftar order.",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus'
        });

        if (confirm.isConfirmed) {
            isLoading.value = true;
            try {
                const payload = {
                    id: id
                }
                // Pastikan Anda sudah membuat deleteTransaksiDetail di transaksiService
                await transaksiService.batalTransaksiDetail(payload);
                toast.success("Produk berhasil dihapus");
                await fetchTransaksiDetail();
            } catch (error) {
                toast.error("Gagal menghapus produk");
            } finally {
                isLoading.value = false;
            }
        }
    };

    // Hitung nilai potongan poin (Misal: 1 poin = Rp 1.000, sesuaikan dengan logic bisnis Anda)
    const calculatePotonganPoint = computed(() => {
        // Hanya hitung jika switch diaktifkan dan input valid
        if (usePoint.value && inputPoint.value >= 10) {
            return inputPoint.value * 1000; // 1 poin = Rp 1.000
        }
        return 0;
    });

    // Di dalam usePOS.js
    const paymentTransaksi = async (grandTotal) => {
        if (!formPOS.pelanggan) {
            toast.error("Pilih pelanggan terlebih dahulu");
            return;
        }

        if (usePoint.value) {
            if (inputPoint.value < 10) {
                toast.error("Minimal penggunaan poin adalah 10");
                return;
            }
            if (inputPoint.value > formPOS.pelanggan.point) {
                toast.error("Poin melebihi saldo yang dimiliki pelanggan");
                return;
            }
        }

        isLoading.value = true;
        try {
            const payload = {
                kode: TransaksiID.value,
                pelanggan: formPOS.pelanggan.value,
                diskon: selectedDiskon.value ? selectedDiskon.value.value : null,
                point_digunakan: usePoint.value ? inputPoint.value : 0,
                total: grandTotal
            };

            const response = await transaksiService.paymentTransaksi(payload);

            if (response.status) {
                lastCompletedTransactionId.value = TransaksiID.value;

                // --- LOGIKA KIRIM TELEGRAM ---

                const sekarang = new Date();
                const waktu = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const tanggal = sekarang.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

                const namaPelanggan = formPOS.pelanggan.label || 'Umum';

                // 1. Susun Rincian Barang
                const daftarProduk = TransaksiDetail.value.map((item, index) => {
                    const namaItem = item.nama || item.nama_produk || (item.produk ? item.produk.nama : 'Produk Tidak Diketahui');
                    const beratItem = item.berat || 0;
                    const hargaPerGram = item.hargajual || 0;

                    return `${index + 1}. *${namaItem}*\n    ${beratItem}g | Rp ${hargaPerGram.toLocaleString('id-ID')}/g`;
                }).join('\n');

                // 2. Susun Baris Diskon (Jika ada)
                const infoDiskon = selectedDiskon.value
                    ? `\n🎁 *Diskon:* ${selectedDiskon.value.label} (-Rp ${selectedDiskon.value.nilai.toLocaleString('id-ID')})`
                    : "";

                const token = "8084477106:AAEbnUkECjGihJOajb4Yv-81qNvNgTH5CMs";
                const chatId = "918285773";

                const pesan = `
✅ *TRANSAKSI BERHASIL*
━━━━━━━━━━━━━━━
📅 *Tanggal:* ${tanggal}
🕒 *Jam:* ${waktu} WIB
🆔 *Kode:* ${TransaksiID.value}
👤 *Pelanggan:* ${namaPelanggan}

📦 *Detail Barang:*
${daftarProduk}
━━━━━━━━━━━━━━━${infoDiskon}
💰 *Grand Total:* Rp ${grandTotal.toLocaleString('id-ID')}
🪙 *Poin Digunakan:* ${payload.point_digunakan}
━━━━━━━━━━━━━━━
_Notifikasi Otomatis Sistem POS_
`;

                fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: pesan,
                        parse_mode: 'Markdown'
                    })
                }).catch(err => console.error("Gagal kirim notif Telegram:", err));

                // --- AKHIR LOGIKA TELEGRAM ---

                const modalElement = document.getElementById('paymentModal');
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.show();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Gagal memproses pembayaran");
        } finally {
            isLoading.value = false;
        }
    };

    const handleNextOrder = async () => {
        // 1. Reset state POS
        formPOS.pelanggan = null;
        selectedDiskon.value = null;
        TransaksiDetail.value = [];
        usePoint.value = false;
        inputPoint.value = 0;

        // 2. Tutup modal payment secara manual
        const payModal = document.getElementById('paymentModal');
        const payInstance = bootstrap.Modal.getInstance(payModal);
        if (payInstance) payInstance.hide();

        // 3. Ambil data baru untuk transaksi selanjutnya
        await fetchKodeTransaksi();
        await fetchProduk();

        toast.info("Siap untuk transaksi baru");
    };

    // Di View (Parent) handlePrint
    const handlePrint = async () => {
        const kode = lastCompletedTransactionId.value;
        if (!kode) return;

        const payload = {
            kode: kode,
        };

        try {
            const { url } = await transaksiService.CetakNotaPenjulan(payload)
            window.open(url, '_blank')
        } catch (e) {
            toast.error('Gagal mencetak nota penjualan')
        }
    };

    const handleSendWhatsApp = () => {
        const pelanggan = formPOS.pelanggan;

        if (!pelanggan || !pelanggan.kontak) {
            toast.error("Nomor kontak pelanggan tidak ditemukan");
            return;
        }

        // 1. Ambil pesan singkat (bisa dimodifikasi sesuai kebutuhan)
        const pesan = `Halo Kak ${pelanggan.label}, terima kasih sudah berbelanja! Transaksi ${lastCompletedTransactionId.value} telah berhasil.`;

        // 2. Bersihkan nomor (menghilangkan spasi, strip, dll)
        let phone = pelanggan.kontak.replace(/\D/g, '');

        // 3. Validasi format Internasional (ID: 62)
        if (phone.startsWith('0')) {
            phone = '62' + phone.slice(1);
        } else if (!phone.startsWith('62')) {
            // Jika nomor hanya "81..." tanpa 0 atau 62 di depan
            phone = '62' + phone;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(pesan)}`;
        window.open(url, '_blank');
    };

    // Fungsi ini dipanggil saat tombol WA di Modal Pembayaran diklik
    const openWhatsAppModal = () => {
        if (!formPOS.pelanggan) {
            toast.error("Pilih pelanggan terlebih dahulu");
            return;
        }

        const selectedId = formPOS.pelanggan.value;
        const pelangganRaw = PelangganList.value.find(p => p.value === selectedId);

        if (pelangganRaw) {
            // 1. Ambil instance modal payment yang sedang terbuka, lalu sembunyikan
            const payModal = document.getElementById('paymentModal');
            const payInstance = bootstrap.Modal.getOrCreateInstance(payModal);
            payInstance.hide();

            // 2. Buka modal kirim pesan dari usePelanggan
            handleKirimPesanForm({
                id: pelangganRaw.value,
                nama: pelangganRaw.label,
                kontak: pelangganRaw.kontak
            });
        }
    };

    const backToPaymentModal = () => {
        // 1. Sembunyikan modal kirim pesan
        const msgModal = document.getElementById('formKirimPesanModal');
        const msgInstance = bootstrap.Modal.getInstance(msgModal);
        if (msgInstance) msgInstance.hide();

        // 2. Munculkan kembali modal sukses (paymentModal)
        const payModal = document.getElementById('paymentModal');
        const payInstance = bootstrap.Modal.getOrCreateInstance(payModal);
        payInstance.show();
    };

    const handleRefresh = async () => {
        await fetchProduk();
    }

    const totalPagesProduk = computed(() => {
        const query = String(searchProdukQuery.value || '').toLowerCase();
        const filteredCount = (produk.value || []).filter(item => {
            return String(item.nama ?? '').toLowerCase().includes(query) ||
                String(item.kodeproduk ?? '').toLowerCase().includes(query)
        }).length;

        return Math.ceil(filteredCount / itemsPerPageProduk) || 1;
    });

    const displayedPagesProduk = computed(() => {
        const total = totalPagesProduk.value;
        const current = currentPageProduk.value;
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
        jenisprodukList,
        selectedJenisProduk,
        produk,
        TransaksiID,
        PelangganList,
        DiskonList,
        selectedDiskon,
        selectedDiskonNilai,
        TransaksiDetail,
        isLoading,
        errors,
        formPOS,
        lastCompletedTransactionId,
        fetchJenisProduk,
        fetchProduk,
        fetchKodeTransaksi,
        fetchPelanggan,
        fetchDiskon,
        fetchTransaksiDetail,
        totalPagesProduk,
        itemsPerPageProduk,
        displayedPagesProduk,
        searchProdukQuery,
        currentPageProduk,
        filteredProduk: computed(() => {
            const query = String(searchProdukQuery.value || '').toLowerCase();
            return (produk.value || []).filter(item =>

                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );
        }),
        paginatedProduk: computed(() => {
            const start = (currentPageProduk.value - 1) * itemsPerPageProduk;
            const query = String(searchProdukQuery.value || '').toLowerCase();

            const filtered = (produk.value || []).filter(item =>
                String(item.kodeproduk ?? '').toLowerCase().includes(query) ||
                String(item.nama ?? '').toLowerCase().includes(query)
            );

            return filtered.slice(start, start + itemsPerPageProduk);
        }),
        handlePilihProduk,
        handleRefresh,
        handleNextOrder,
        paymentTransaksi,
        handleDelete,
        handlePrint,
        usePoint,
        inputPoint,
        calculatePotonganPoint,
        scanQuery,
        handleBarcodeScan,
        openWhatsAppModal,
        handleSendWhatsApp,
        backToPaymentModal
    };
}
