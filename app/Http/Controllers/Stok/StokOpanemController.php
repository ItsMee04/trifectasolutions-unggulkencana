<?php

namespace App\Http\Controllers\Stok;

use App\Http\Controllers\Controller;
use App\Models\Stok\Stok;
use App\Models\Stok\StokDetail;
use App\Services\StokService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StokOpanemController extends Controller
{
    protected $stokService;

    public function __construct(StokService $stokService)
    {
        $this->stokService = $stokService;
    }

    public function getPeriodeStokOpname()
    {
        $data = Stok::where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data periode stok opname tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data periode stok berhasil ditemukan',
            'data'      => $data
        ], 200);
    }

    public function storePeriodeStokOpname(Request $request)
    {
        $request->validate([
            // Menambahkan rule unique:table,column
            'periode' => 'required|date|unique:stok,tanggal',
        ], [
            // Opsional: Pesan kustom agar lebih user-friendly
            'periode.required' => 'Periode tidak boleh kosong.',
            'periode.unique' => 'Periode stok untuk tanggal ini sudah ada.',
        ]);

        DB::beginTransaction();

        try {

            $kode = $this->stokService->generateKode();

            $data = Stok::create([
                'kode'      => $kode,
                'tanggal'   => $request->periode,
                'oleh'      => Auth::user()->id,
                'status'    => 1,
            ]);

            if ($data) {
                StokDetail::create([
                    'kode'  => $kode,
                ]);
            }

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

    public function getStokOpnameDetail(Request $request)
    {
        $request->validate([
            'kode' => 'required|exists:stok,kode',
        ]);

        $data = StokDetail::where('kode', $request->kode)->get();

        if($data->isEmpty()){
            return response()->json([
                'status'    => false,
                'message'   => 'Data stok opname tidak ditemukan',
                'data'      => []
            ]);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data stok opname berhasil ditemukan',
            'data'      => $data
        ]);
    }
}
