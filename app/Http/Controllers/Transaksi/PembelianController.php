<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Models\Transaksi\Pembelian;
use App\Models\Transaksi\PembelianDetail;
use App\Models\Transaksi\Transaksi;
use App\Services\PembelianService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PembelianController extends Controller
{
    protected $pembelianService;

    // Inject service melalui constructor
    public function __construct(PembelianService $pembelianService)
    {
        $this->pembelianService = $pembelianService;
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
        $data = PembelianDetail::with(['produk', 'transaksi', 'produk.karat', 'pembelian.pelanggan'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data keranjang tidak ditemukan',
                'data'      => []
            ], 404);
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
            'kondisi_id'      => 'nullable|exists:kondisi,id', // Sesuaikan nama tabel kondisi Anda
            'jenis_hargabeli' => 'required|string',
            'keterangan'      => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            $detail = PembelianDetail::findOrFail($request->id);

            // 1. Update data dasar
            $detail->hargabeli       = $request->hargabeli;
            $detail->kondisi_id      = $request->kondisi_id;
            $detail->jenis_hargabeli = $request->jenis_hargabeli;
            $detail->keterangan      = $request->keterangan;

            // 2. Kalkulasi Total (Harga Beli * Berat)
            // Pastikan berat diambil dari record detail atau request jika berubah
            $total = $request->hargabeli * $detail->berat;
            $detail->total = $total;

            // 3. Generate Terbilang menggunakan Service Anda
            // Asumsi service Anda mengembalikan string "Satu Juta..."
            $detail->terbilang = $this->pembelianService->terbilang($total);

            $detail->save();

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Detail pembelian berhasil diperbarui',
                'data'    => $detail
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage()
            ], 500);
        }
    }
}
