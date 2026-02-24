<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Suplier;
use App\Services\SuplierService;
use Illuminate\Http\Request;

class SuplierController extends Controller
{
    protected $suplierService;

    // Inject service melalui constructor
    public function __construct(SuplierService $suplierService)
    {
        $this->suplierService = $suplierService;
    }

    public function getSuplier()
    {
        $data = Suplier::where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data suplier tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data suplier berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeSuplier(Request $request)
    {
        $request->validate([
            'nama'   => 'required|string|max:100',
        ]);

        try {
            // Panggil generator kode dari service
            $kodeBaru = $this->suplierService->generateKodeSuplier();

            $suplier = Suplier::create([
                'kode'    => $kodeBaru,
                'nama'    => strtoupper($request->nama),
                'kontak'  => $request->kontak,
                'alamat'  => strtoupper($request->alamat),
                'status'  => 1
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Suplier berhasil ditambahkan',
                'data' => $suplier
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updateSuplier(Request $request)
    {
        $request->validate([
            'nama'   => 'required|string|max:100',
        ]);

        $suplier = Suplier::find($request->id);

        if (!$suplier) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data suplier tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $suplier->update([
            'nama'    => strtoupper($request->nama),
            'kontak'  => $request->kontak,
            'alamat'  => strtoupper($request->alamat),
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data suplier berhasil diupdate',
            'data'      => $suplier,
        ], 200);
    }

    public function deleteSuplier(Request $request)
    {
        $suplier = Suplier::find($request->id);

        if (!$suplier) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data suplier tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $suplier->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data suplier berhasil dihapus',
            'data'      => $suplier,
        ], 200);
    }
}
