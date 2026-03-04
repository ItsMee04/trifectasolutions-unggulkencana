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
        $data = StokHarian::where('status', 1)->get();

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
}
