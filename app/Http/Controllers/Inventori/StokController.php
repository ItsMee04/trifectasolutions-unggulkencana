<?php

namespace App\Http\Controllers\Inventori;

use App\Http\Controllers\Controller;
use App\Models\Inventori\StokHarian;
use App\Models\Master\NampanProduk;
use App\Services\StokService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StokController extends Controller
{
    protected $stokService;

    public function __construct(StokService $stokService)
    {
        $this->stokService = $stokService;
    }

    public function getPeriodeStok()
    {
        $data = StokHarian::where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data periode stok tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data periode stok berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storePeriodeStok(Request $request)
    {
        $request->validate([
            'periode'   => 'required|date',
        ]);

        DB::beginTransaction();

        try {

            $kode = $this->stokService->generateKodeStok();

            $data = StokHarian::create([
                'kode'      => $kode,
                'periode'   => $request->periode,
                'oleh'      => Auth::user()->id,
                'status'    => 1,
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Data periode berhasil disimpan',
                'data' => $data
            ], 201);
        } catch (\Exception $e) {
            // Jika ada error apa pun (DB error, Disk full, dll), batalkan semua
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getNampanProdukByPeriodeStok(Request $request)
    {
        $request->validate([
            'periode' => 'required', // Ini adalah ID dari StokHarian
        ]);

        // 1. Cari detail periodenya dulu
        $periode = StokHarian::where('id', $request->periode)->first();

        if (!$periode) {
            return response()->json([
                'status'  => false,
                'message' => 'Periode tidak ditemukan',
            ], 404);
        }

        // 2. Cari data produk berdasarkan TANGGAL dari periode tersebut
        $data = NampanProduk::with(['nampan', 'produk', 'users'])
            ->where('tanggal', $periode->periode)
            ->get();

        // 3. Kembalikan variabel $data, bukan $periode
        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan produk berhasil ditemukan',
            'data'      => $data, // Ubah ke $data agar list produk terkirim
        ], 200);
    }

    public function getRekapStokByPeriode(Request $request)
    {
        $request->validate([
            'periode' => 'required|exists:stokharian,id'
        ]);

        // 1. Ambil detail periode yang sedang dipilih
        $periodeAktif = StokHarian::findOrFail($request->periode);
        $tanggalPilihan = $periodeAktif->periode;

        // 2. Query utama menggunakan Query Builder untuk performa maksimal
        // Kita gunakan jenisproduk sebagai base agar semua kategori muncul
        $rekap = DB::table('jenisproduk as jp')
            ->select('jp.jenis as nama_kategori')
            ->addSelect(DB::raw("
                -- STOK AWAL (Binding tanggalPilihan ke subquery)
                COALESCE((
                    SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN 1 ELSE -1 END)
                    FROM nampanproduk n2
                    JOIN produk p2 ON n2.produk_id = p2.id
                    WHERE p2.jenisproduk_id = jp.id AND DATE(n2.tanggal) < '{$tanggalPilihan}'
                ), 0) as unit_awal,

                COALESCE((
                    SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN p2.berat ELSE -p2.berat END)
                    FROM nampanproduk n2
                    JOIN produk p2 ON n2.produk_id = p2.id
                    WHERE p2.jenisproduk_id = jp.id AND DATE(n2.tanggal) < '{$tanggalPilihan}'
                ), 0) as berat_awal,

                -- PERGERAKAN HARI INI (Gunakan subquery agar tidak duplikasi akibat join)
                COALESCE((
                    SELECT SUM(CASE WHEN n3.jenis = 'MASUK' THEN 1 ELSE 0 END)
                    FROM nampanproduk n3
                    JOIN produk p3 ON n3.produk_id = p3.id
                    WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = '{$tanggalPilihan}'
                ), 0) as unit_masuk,

                COALESCE((
                    SELECT SUM(CASE WHEN n3.jenis = 'KELUAR' THEN 1 ELSE 0 END)
                    FROM nampanproduk n3
                    JOIN produk p3 ON n3.produk_id = p3.id
                    WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = '{$tanggalPilihan}'
                ), 0) as unit_keluar,

                COALESCE((
                    SELECT SUM(CASE WHEN n3.jenis = 'MASUK' THEN p3.berat ELSE 0 END)
                    FROM nampanproduk n3
                    JOIN produk p3 ON n3.produk_id = p3.id
                    WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = '{$tanggalPilihan}'
                ), 0) as berat_masuk,

                COALESCE((
                    SELECT SUM(CASE WHEN n3.jenis = 'KELUAR' THEN p3.berat ELSE 0 END)
                    FROM nampanproduk n3
                    JOIN produk p3 ON n3.produk_id = p3.id
                    WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = '{$tanggalPilihan}'
                ), 0) as berat_keluar
            "))
            ->get();

        // 3. Tambahkan kalkulasi Stok Akhir di tingkat koleksi (Clean Code)
        $dataFinal = $rekap->map(function ($item) {
            return [
                'kategori'     => $item->nama_kategori,
                'stok_awal'    => [
                    'unit'  => (int)$item->unit_awal,
                    'berat' => round($item->berat_awal, 3)
                ],
                'masuk'        => [
                    'unit'  => (int)$item->unit_masuk,
                    'berat' => round($item->berat_masuk, 3)
                ],
                'keluar'       => [
                    'unit'  => (int)$item->unit_keluar,
                    'berat' => round($item->berat_keluar, 3)
                ],
                'stok_akhir'   => [
                    'unit'  => (int)($item->unit_awal + $item->unit_masuk - $item->unit_keluar),
                    'berat' => round(($item->berat_awal + $item->berat_masuk - $item->berat_keluar), 3)
                ]
            ];
        });

        return response()->json([
            'status'        => true,
            'message'       => 'Data stok harian berhasil ditemukan',
            'periode_info'  => [
                'tanggal'   => $tanggalPilihan,
                'status'    => $periodeAktif->status
            ],
            'rekap'         => $dataFinal
        ]);
    }

    public function finalPeriodeStok(Request $request)
    {
        $periode = StokHarian::find($request->id);

        if (!$periode) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data periode stok tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $periode->update([
            'status'    => 2,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data periode stok berhasil dihapus',
            'data'      => $periode,
        ], 200);
    }
}
