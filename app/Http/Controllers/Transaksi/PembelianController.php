<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Models\Transaksi\Pembelian;
use App\Models\Transaksi\PembelianDetail;
use App\Models\Transaksi\Perbaikan;
use App\Models\Transaksi\Transaksi;
use App\Services\PembelianService;
use App\Services\PerbaikanService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
// use Milon\Barcode\DNS1D;

class PembelianController extends Controller
{
    protected $pembelianService;
    protected $productService;
    protected $perbaikanService;

    // Inject service melalui constructor
    public function __construct(
        PembelianService $pembelianService,
        ProductService $productService,
        PerbaikanService $perbaikanService
    ) {
        $this->pembelianService = $pembelianService;
        $this->productService = $productService;
        $this->perbaikanService = $perbaikanService;
    }

    public function getKodeTransaksi()
    {
        try {
            // 1. Cari apakah ada transaksi milik user login yang statusnya masih DRAFT (1)
            $transaksiAktif = Pembelian::where('oleh', Auth::id())
                ->where('status', 1)
                ->latest()
                ->first();

            if ($transaksiAktif) {
                // Jika ada, gunakan kode yang sudah ada di database
                $kode = $transaksiAktif->kode;
                $message = 'Menggunakan kode transaksi aktif';
            } else {
                // Jika tidak ada, barulah panggil service untuk generate nomor urut baru
                $kode = $this->pembelianService->generateKodeTransaksi();
                $message = 'Kode transaksi baru berhasil di-generate';
            }

            return response()->json([
                'status'  => true,
                'message' => $message,
                'kode'    => $kode
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate kode: ' . $e->getMessage()], 500);
        }
    }

    public function getTransaksiByKode(Request $request)
    {
        $request->validate([
            'kode' => 'required',
        ]);

        $data = Transaksi::where('kode', $request->kode)->with(['pelanggan', 'diskon', 'transaksidetail', 'transaksidetail.produk'])->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data transaksi tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data transaksi berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeProdukToPembelianDetail(Request $request)
    {
        $request->validate([
            'kode'              => 'required',
            'kodetransaksi'     => 'required',
            'produk'            => 'required|exists:transaksidetail,produk_id'
        ]);

        try {
            $produk = Produk::with('karat')->where('id', $request->produk)->firstOrFail();
            $sudahDipilih = PembelianDetail::where('produk_id', $produk->id)
                ->where('status', 1)
                ->exists();

            if ($sudahDipilih) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal! Produk ini sedang dalam proses transaksi aktif.'
                ], 400);
            }

            DB::beginTransaction();

            $pembelian = Pembelian::firstOrCreate(
                ['kode' => $request->kode],
                [
                    'tanggal'       => now(),
                    'jenis'         => 'DARITOKO',
                    'pelanggan_id'  => $request->pelanggan_id, // Simpan nama pelanggan di sini
                    'total'         => 0,
                    'terbilang'     => 'rupiah',
                    'oleh'          => Auth::id(),
                    'status'        => 1,
                ]
            );

            // 2. Insert ke PembelianDetail
            $detail = new PembelianDetail();
            $detail->kodetransaksi = $request->kodetransaksi;
            $detail->kode          = $request->kode;
            $detail->produk_id     = $produk->id;

            // Ambil data fisik asli dari tabel Produk
            $detail->berat         = $produk->berat;

            /**
             * MENGAMBIL NILAI DARI RELASI
             * Asumsi: Di model Produk ada relasi 'karat' ke tabel master karat.
             * Kita ambil kolom 'nama' atau 'nilai' dari tabel karat tersebut.
             */
            $detail->karat         = $produk->karat->karat ?? null;

            $detail->lingkar       = $produk->lingkar;
            $detail->panjang       = $produk->panjang;

            // Set field wajib
            $detail->jenis         = 'DARITOKO';
            $detail->oleh          = Auth::id();
            $detail->status        = 1;

            /**
             * Field lainnya (kondisi_id, hargabeli, total, terbilang)
             * dibiarkan NULL agar bisa di-input secara manual di tahap selanjutnya.
             */

            $detail->save();

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Produk berhasil ditambahkan ke keranjang.',
                'data'    => $detail
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPembelianDetail()
    {
        $data = PembelianDetail::with(['produk', 'kodetransaksi', 'kodetransaksi.transaksidetail', 'produk.karat', 'produk.harga', 'pembelian.pelanggan'])
            ->where('jenis', 'DARITOKO')
            ->where('status', 1)
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data keranjang tidak ditemukan',
                'data'      => []
            ]);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data keranjang berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function updatePembelianDetail(Request $request)
    {
        $request->validate([
            'id'              => 'required|exists:pembeliandetail,id',
            'hargabeli'       => 'required|numeric|min:0',
            'kondisi_id'      => 'nullable|exists:kondisi,id',
            'jenis_hargabeli' => 'required|string',
            'keterangan'      => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $detail = PembelianDetail::findOrFail($request->id);

            // 1. Update data dasar detail
            $detail->hargabeli       = $request->hargabeli;
            $detail->kondisi_id      = $request->kondisi_id;
            $detail->jenis_hargabeli = $request->jenis_hargabeli;
            $detail->keterangan      = $request->keterangan;

            // 2. Kalkulasi Total Detail (Harga Beli * Berat)
            $totalDetail = $request->hargabeli * $detail->berat;
            $detail->total = $totalDetail;
            $detail->terbilang = $this->pembelianService->terbilang($totalDetail);
            $detail->save();

            // 3. Update Header (Tabel Pembelian)
            // Hitung ulang semua total dari detail yang memiliki kode yang sama
            $pembelian = Pembelian::where('kode', $detail->kode)->first();

            if ($pembelian) {
                $grandTotal = PembelianDetail::where('kode', $detail->kode)
                    ->where('status', 1) // Pastikan hanya yang aktif
                    ->sum('total');

                $pembelian->total = $grandTotal;
                // Update terbilang untuk total keseluruhan di nota
                $pembelian->terbilang = $this->pembelianService->terbilang($grandTotal);
                $pembelian->save();
            }

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Detail dan Total Pembelian berhasil diperbarui',
                'data'    => $detail,
                'header'  => $pembelian // Kita kembalikan data header juga untuk update UI jika perlu
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function batalPembelianDetail(Request $request)
    {
        try {
            DB::beginTransaction();

            // 1. Cari detail yang masih aktif (status 1)
            $detail = PembelianDetail::where('id', $request->id)
                ->where('status', 1)
                ->firstOrFail();

            $kodeTransaksi = $detail->kode;
            $totalDibatalkan = $detail->total;

            // 2. Ubah status menjadi 0 (Batal/History) bukannya dihapus
            $detail->update([
                'status' => 0,
                'oleh'   => Auth::id() // Mencatat siapa yang membatalkan
            ]);

            // 3. Update Header Transaksi agar nominalnya berkurang
            $transaksi = Pembelian::where('kode', $kodeTransaksi)->first();

            if ($transaksi) {
                // Hitung total baru hanya dari detail yang masih status 1
                $newTotal = PembelianDetail::where('kode', $kodeTransaksi)
                    ->where('status', 1)
                    ->sum('total');

                $transaksi->update([
                    'total'     => $newTotal,
                    'terbilang' => $this->pembelianService->terbilang($newTotal) . " rupiah",
                    'status'    => 0,
                ]);
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Produk dibatalkan dari keranjang'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal membatalkan produk: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentPembelian(Request $request)
    {
        $request->validate([
            'kode'         => 'required', // Kode PM-xxxx
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Saldo Aktif (Toko bayar pakai rekening ini)
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if (!$saldoAktif) {
                throw new \Exception("Tidak ada rekening saldo aktif untuk melakukan pembayaran.");
            }

            // 2. Cari Header Pembelian
            $pembelian = Pembelian::where('kode', $request->kode)->firstOrFail();

            // 3. Ambil Semua Detail Pembelian
            $details = PembelianDetail::where('kode', $request->kode)
                ->where('status', 1)
                ->get();

            if ($details->isEmpty()) {
                throw new \Exception("Tidak ada produk dalam keranjang pembelian.");
            }

            foreach ($details as $item) {
                $produk = Produk::findOrFail($item->produk_id);

                // --- LOGIKA PERBAIKAN & PENCUCIAN ---
                // Tentukan keterangan berdasarkan kondisi_id
                if ($item->kondisi_id == 1) {
                    // KONDISI BAIK: Masuk perbaikan dengan catatan Pencucian
                    $keteranganPerbaikan = "PENCUCIAN: Barang masuk dari pembelian " . $pembelian->kode;
                } else {
                    // KONDISI RUSAK: Masuk perbaikan dengan catatan Dilebur
                    $keteranganPerbaikan = "DILEBUR: Barang masuk dari pembelian " . $pembelian->kode . ". Catatan: " . ($item->keterangan ?? 'Rusak');
                }

                // Update Master Produk ke Status 2 (Dalam Perbaikan/Karantina)
                $produk->update([
                    'status'    => 2,
                    'hargabeli' => $item->hargabeli,
                ]);

                Perbaikan::create([
                    'kode'          => $this->perbaikanService->generateKodeTransaksi(),
                    'produk_id'     => $produk->id,
                    'kondisi_id'    => $item->kondisi_id,
                    'keterangan'    => $keteranganPerbaikan,
                    'tanggalmasuk'  => now(),
                    'oleh'          => Auth::id(),
                    'status'        => 1,
                ]);

                // Update status detail menjadi lunas/selesai
                $item->update(['status' => 2]);
            }

            // 4. Update Header Pembelian
            $pembelian->update([
                'keterangan'   => $request->keterangan ?? $pembelian->keterangan,
                'status'       => 2, // Lunas
                'tanggal'      => now(),
            ]);

            // 5. INSERT MUTASI SALDO (Uang Toko KELUAR)
            DB::table('mutasisaldo')->insert([
                'saldo_id'   => $saldoAktif->id,
                'tanggal'    => now()->format('Y-m-d'),
                'keterangan' => "Pembelian produk (Buyback) Kode: " . $pembelian->kode,
                'jenis'      => 'KELUAR',
                'jumlah'     => $pembelian->total,
                'oleh'       => Auth::id(),
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 6. Potong Total Saldo di Tabel Rekening
            DB::table('saldo')->where('id', $saldoAktif->id)->decrement('total', $pembelian->total);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Transaksi Pembelian Berhasil. Produk otomatis masuk ke daftar Perbaikan/Pencucian.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal bayar pembelian: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPembelianDetailDariLuar(Request $request)
    {
        $data = PembelianDetail::with(['produk', 'kodetransaksi' ,'produk.karat', 'pembelian.pelanggan'])
            ->where('jenis', 'LUARTOKO')
            ->where('status', 1)
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data keranjang tidak ditemukan',
                'data'      => []
            ]);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data keranjang berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeProdukToPembelianDetailDariLuar(Request $request)
    {
        $request->validate([
            'nama'          => 'required',
            'berat'         => ['required', 'regex:/^\d+\.\d{1,}$/'],
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'karat'         => 'required|exists:karat,id',
            'jeniskarat'    => 'required|exists:jeniskarat,id',
            'lingkar'       => 'nullable|integer',
            'panjang'       => 'nullable|integer',
            'hargabeli'     => 'required|integer',
            'keterangan'    => 'nullable|string',
            'kode'          => 'required',
        ]);

        $exists = PembelianDetail::where('kode', $request->kode)->exists();

        if ($exists) {
            return response()->json([
                'status'  => false,
                'message' => 'Gagal: Transaksi ini sudah memiliki barang. Hanya diperbolehkan 1 barang per transaksi.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // 1. Generate Kode & Barcode
            $kodeproduk = $this->productService->generateUniqueCode();

            $barcodeGenerator = new \Milon\Barcode\DNS1D();
            $barcodeBase64 = $barcodeGenerator->getBarcodeJPG($kodeproduk, 'C128', 1.2, 20);
            $barcodeData = base64_decode($barcodeBase64);
            $barcodePath = 'images/barcode/' . $kodeproduk . '.jpg';

            // Simpan Barcode ke Storage
            Storage::disk('public')->put($barcodePath, $barcodeData);

            // 2. Simpan ke Master Produk
            $produk = Produk::create([
                'kodeproduk'      => $kodeproduk,
                'nama'            => strtoupper($request->nama),
                'berat'           => $request->berat,
                'jenisproduk_id'  => $request->jenisproduk,
                'karat_id'        => $request->karat,
                'jeniskarat_id'   => $request->jeniskarat,
                'lingkar'         => $request->lingkar ?? 0,
                'panjang'         => $request->panjang ?? 0,
                'harga_id'        => $request->hargajual,
                'hargabeli'       => $request->hargabeli,
                'keterangan'      => strtoupper($request->keterangan),
                'status'          => 0,
            ]);

            // 3. Ambil atau Buat Header Pembelian (Total tetap 0 sampai Payment)
            $pembelian = Pembelian::firstOrCreate(
                ['kode' => $request->kode],
                [
                    'tanggal'   => now(),
                    'jenis'     => 'LUARTOKO',
                    'total'     => 0,
                    'terbilang' => 'nol rupiah',
                    'oleh'      => Auth::id(),
                    'status'    => 1, // Status draft/proses
                ]
            );

            // 4. Insert ke PembelianDetail
            $detail = new PembelianDetail();
            $detail->kode       = $pembelian->kode;
            $detail->produk_id  = $produk->id;
            $detail->hargabeli  = $request->hargabeli;
            $detail->berat      = $produk->berat;
            // Gunakan ->karat (atau field nama pada tabel karat)
            $detail->karat      = $produk->karat->karat ?? null;
            $detail->lingkar    = $produk->lingkar;
            $detail->panjang    = $produk->panjang;
            $detail->kondisi_id = $request->kondisi;
            $detail->jenis      = 'LUARTOKO';
            // Hitung Total: Berat x Harga Beli
            $totalPerProduk     = $detail->berat * (int)$request->hargabeli;
            $detail->total      = $totalPerProduk;

            // Ambil Terbilang menggunakan Service yang sudah ada
            $detail->terbilang   = $this->pembelianService->terbilang($totalPerProduk);
            $detail->oleh       = Auth::id();
            $detail->status     = 1;
            $detail->save();

            // SELESAI: Commit transaksi agar tersimpan permanen
            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Produk berhasil didaftarkan ke detail pembelian.',
                'data'    => $detail
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            // Hapus file barcode jika gagal agar storage tidak "sampah"
            if (isset($barcodePath)) {
                Storage::disk('public')->delete($barcodePath);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updatePembelianDetailDariLuar(Request $request)
    {
        $request->validate([
            'id'            => 'required|exists:pembeliandetail,id', // Tambahkan validasi ID detail
            'nama'          => 'required',
            'berat'         => ['required', 'regex:/^\d+\.\d{1,}$/'],
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'karat'         => 'required|exists:karat,id',
            'jeniskarat'    => 'required|exists:jeniskarat,id',
            'lingkar'       => 'nullable|integer',
            'panjang'       => 'nullable|integer',
            'hargabeli'     => 'required|integer',
            'keterangan'    => 'nullable|string',
            'kode'          => 'required',
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Detail Pembelian
            $detail = PembelianDetail::findOrFail($request->id);

            // 2. Cari dan Update Produk (Gunakan find agar mendapatkan Object, bukan Integer)
            $produk = Produk::findOrFail($detail->produk_id);
            $produk->update([
                'nama'            => strtoupper($request->nama),
                'berat'           => $request->berat,
                'jenisproduk_id'  => $request->jenisproduk,
                'karat_id'        => $request->karat,
                'jeniskarat_id'   => $request->jeniskarat,
                'lingkar'         => $request->lingkar ?? 0,
                'panjang'         => $request->panjang ?? 0,
                'harga_id'        => $request->hargajual,
                'hargabeli'       => $request->hargabeli,
                'keterangan'      => strtoupper($request->keterangan),
                'kondisi_id'      => $request->kondisi, // Pastikan kondisi_id juga terupdate di master produk
            ]);

            // 3. Update data detail (Ambil nilai dari object $produk yang sudah diupdate)
            $detail->hargabeli  = $request->hargabeli;
            $detail->berat      = $produk->berat;

            // Load relasi karat agar tidak null jika ingin mengambil nama karatnya
            $produk->load('karat');
            $detail->karat      = $produk->karat->karat ?? null;

            $detail->lingkar    = $produk->lingkar;
            $detail->panjang    = $produk->panjang;
            $detail->kondisi_id = $request->kondisi;
            $detail->jenis      = 'LUARTOKO';

            // 4. Hitung Total & Terbilang
            $totalPerProduk     = (float)$produk->berat * (int)$request->hargabeli;
            $detail->total      = $totalPerProduk;
            $detail->terbilang  = $this->pembelianService->terbilang($totalPerProduk);

            $detail->oleh       = Auth::id();
            $detail->status     = 1;
            $detail->save();

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Detail dan Total Pembelian berhasil diperbarui',
                'data'    => $detail,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function batalPembelianDetailDariLuar(Request $request)
    {
        try {
            DB::beginTransaction();

            // 1. Cari detail yang aktif (status 1)
            $detail = PembelianDetail::where('id', $request->id)
                ->where('status', 1)
                ->firstOrFail();

            $kodeTransaksi = $detail->kode;

            // 2. Update Status Detail menjadi 0 (Batal)
            $detail->update([
                'status' => 0,
                'oleh'   => Auth::id()
            ]);

            // 3. Update Master Produk menjadi 0 (Batal)
            // Karena 1 detail = 1 produk, kita nonaktifkan produknya
            if ($detail->produk_id) {
                $produk = Produk::find($detail->produk_id);
                if ($produk) {
                    $produk->update(['status' => 0]);
                }
            }

            // 4. Update Header Pembelian
            // Karena hanya ada 1 barang, maka jika dibatalkan total jadi 0 dan status jadi 0
            $transaksi = Pembelian::where('kode', $kodeTransaksi)->first();

            if ($transaksi) {
                $transaksi->update([
                    'total'     => 0,
                    'terbilang' => "nol rupiah",
                    'status'    => 0, // Langsung set 0 sesuai permintaan (1 transaksi 1 barang)
                ]);
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Barang dan Transaksi berhasil dibatalkan.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal membatalkan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentPembelianDariLuar(Request $request)
    {
        $request->validate([
            'kode'          => 'required', // Kode PM-xxxx
            'sumber'        => 'required|in:supplier,pelanggan',
            'selectedId'    => 'required|integer',
            'keterangan'    => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Saldo Aktif
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if (!$saldoAktif) {
                throw new \Exception("Tidak ada rekening saldo aktif untuk melakukan pembayaran.");
            }

            // 2. Cari Header Pembelian
            $pembelian = Pembelian::where('kode', $request->kode)->firstOrFail();

            // 3. Ambil Semua Detail Pembelian yang masih aktif (Status 1)
            $details = PembelianDetail::where('kode', $request->kode)
                ->where('status', 1)
                ->get();

            if ($details->isEmpty()) {
                throw new \Exception("Tidak ada produk dalam keranjang pembelian.");
            }

            // --- HITUNG ULANG TOTAL DARI DETAIL ---
            $totalFix = $details->sum('total');
            $terbilangFix = $this->pembelianService->terbilang($totalFix) . " rupiah";

            foreach ($details as $item) {
                $produk = Produk::findOrFail($item->produk_id);

                // Logika Keterangan Perbaikan berdasarkan kondisi
                if ($item->kondisi_id == 1) {
                    $keteranganPerbaikan = "PENCUCIAN: Barang masuk dari pembelian " . $pembelian->kode;
                } else {
                    $keteranganPerbaikan = "DILEBUR: Barang masuk dari pembelian " . $pembelian->kode . ". Catatan: " . ($item->keterangan ?? 'Rusak');
                }

                // Update Master Produk ke Status 2 (Karantina/Perbaikan)
                $produk->update([
                    'status'    => 2,
                    'hargabeli' => $item->hargabeli,
                ]);

                Perbaikan::create([
                    'kode'          => $this->perbaikanService->generateKodeTransaksi(),
                    'produk_id'     => $produk->id,
                    'kondisi_id'    => $item->kondisi_id,
                    'keterangan'    => $keteranganPerbaikan,
                    'tanggalmasuk'  => now(),
                    'oleh'          => Auth::id(),
                    'status'        => 1,
                ]);

                // Update status detail menjadi lunas/selesai (Status 2)
                $item->update(['status' => 2]);
            }

            // 4. Update Header Pembelian (Finalisasi)
            $updateData = [
                'total'         => $totalFix,
                'terbilang'     => $terbilangFix,
                'keterangan'    => strtoupper($request->keterangan) ?? $pembelian->keterangan,
                'status'        => 2, // Lunas
                'tanggal'       => now(),
                'oleh'          => Auth::id(),
            ];

            // Masukkan ID berdasarkan sumbernya
            if ($request->sumber === 'supplier') {
                $updateData['suplier_id'] = $request->selectedId;
                $updateData['pelanggan_id'] = null;
            } else {
                $updateData['pelanggan_id'] = $request->selectedId;
                $updateData['suplier_id'] = null;
            }

            $pembelian->update($updateData);

            // 5. INSERT MUTASI SALDO
            DB::table('mutasisaldo')->insert([
                'saldo_id'   => $saldoAktif->id,
                'tanggal'    => now()->format('Y-m-d'),
                'keterangan' => "Pembelian Luar (Buyback) " . ($request->sumber) . " Kode: " . $pembelian->kode,
                'jenis'      => 'KELUAR',
                'jumlah'     => $totalFix,
                'oleh'       => Auth::id(),
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 6. Potong Total Saldo di Tabel Rekening
            DB::table('saldo')->where('id', $saldoAktif->id)->decrement('total', $totalFix);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Pembayaran Berhasil. Produk telah masuk ke sistem gudang/perbaikan.',
                'total'   => $totalFix
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal proses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTransaksiPembelian()
    {
        $data = Pembelian::with(['pembeliandetail', 'pembeliandetail.produk', 'suplier', 'pelanggan', 'pembeliandetail.kondisi', 'oleh'])->where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data transaksi tidak ditemukan',
                'data'      => []
            ], 400);
        }

        return response()->json([
            'status'    => true,
            'messaage'  => 'Data transaksi berhasil ditemukan',
            'data'      => $data,
        ], 200);
    }

    public function batalTransaksi(Request $request)
    {
        $request->validate([
            'kode' => 'required', // Kode PM-xxxx
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Header Pembelian
            $pembelian = Pembelian::where('kode', $request->kode)->firstOrFail();

            // Validasi: Hanya status Lunas (2) yang bisa dibatalkan
            if ($pembelian->status != 2) {
                throw new \Exception("Transaksi tidak dapat dibatalkan karena status bukan 'Lunas'.");
            }

            // 2. Ambil Detail Pembelian
            $details = PembelianDetail::where('kode', $request->kode)->get();

            foreach ($details as $item) {
                $produk = Produk::find($item->produk_id);

                if ($produk) {
                    /**
                     * UPDATE STATUS PRODUK:
                     * Jika suplier_id atau pelanggan_id ADA (Luar Toko) -> Status 0
                     * Jika KEDUANYA NULL (Dari Toko) -> Status 2
                     */
                    if ($pembelian->suplier_id || $pembelian->pelanggan_id) {
                        $produk->update(['status' => 0]);
                    } else {
                        $produk->update(['status' => 2]);
                    }
                }

                // 3. MENGHAPUS DATA PERBAIKAN yang otomatis terbuat
                // Berdasarkan produk_id dan mention kode pembelian di kolom keterangan
                DB::table('perbaikan')
                    ->where('produk_id', $item->produk_id)
                    ->where('keterangan', 'like', '%' . $pembelian->kode . '%')
                    ->delete();

                // Kembalikan status detail ke Batal (3)
                $item->update(['status' => 3]);
            }

            // 4. MENGHAPUS MUTASI SALDO TERKAIT
            // Kita hapus baris mutasi 'KELUAR' yang mencatat pembelian kode ini
            DB::table('mutasisaldo')
                ->where('keterangan', 'like', '%' . $pembelian->kode . '%')
                ->where('jenis', 'KELUAR')
                ->delete();

            // 5. MENGEMBALIKAN SALDO (Increment total saldo di tabel rekening)
            // Kita cari saldo yang sebelumnya terpotong (biasanya yang status aktif)
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if ($saldoAktif) {
                DB::table('saldo')->where('id', $saldoAktif->id)->increment('total', $pembelian->total);
            }

            // 6. UPDATE STATUS TRANSAKSI PEMBELIAN MENJADI "BATAL"
            $pembelian->update([
                'status' => 0, // 3 = Batal
                'keterangan' => "TRANSAKSI DIBATALKAN: " . $pembelian->keterangan,
            ]);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Pembatalan Berhasil.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal membatalkan transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
