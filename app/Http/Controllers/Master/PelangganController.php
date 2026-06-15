<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Pelanggan;
use App\Services\PelangganService;
use Illuminate\Http\Request;

class PelangganController extends Controller
{
    protected PelangganService $pelangganService;

    // Inject service melalui constructor
    public function __construct(PelangganService $pelangganService)
    {
        $this->pelangganService = $pelangganService;
    }

    public function getPelanggan()
    {
        $data = Pelanggan::with(['poin'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pelanggan tidak ditemukan',
                'data'      => []
            ], 200);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data pelanggan berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storePelanggan(Request $request)
    {
        $request->validate([
            'nama'   => 'required|string|max:100',
            'tanggal' => 'required'
        ]);

        try {
            // Panggil generator kode dari service
            $kodeBaru = $this->pelangganService->generateKodePelanggan();

            $pelanggan = Pelanggan::create([
                'kode'    => $kodeBaru,
                'nama'    => strtoupper($request->nama),
                'kontak'  => $request->kontak,
                'alamat'  => strtoupper($request->alamat),
                'tanggal' => $request->tanggal,
                'status'  => 1
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Pelanggan berhasil ditambahkan',
                'data' => $pelanggan
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updatePelanggan(Request $request)
    {
        $request->validate([
            'nama'   => 'required|string|max:100',
            'tanggal' => 'required'
        ]);

        $pelanggan = Pelanggan::find($request->id);

        if (!$pelanggan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pelanggan tidak ditemukan',
                'data'      => [],
            ], 200);
        }

        $pelanggan->update([
            'nama'    => strtoupper($request->nama),
            'kontak'  => $request->kontak,
            'alamat'  => strtoupper($request->alamat),
            'tanggal' => $request->tanggal
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data pelanggan berhasil diupdate',
            'data'      => $pelanggan,
        ], 200);
    }

    public function deletePelanggan(Request $request)
    {
        $pelanggan = Pelanggan::find($request->id);

        if (!$pelanggan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pelanggan tidak ditemukan',
                'data'      => [],
            ], 200);
        }

        $pelanggan->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data pelanggan berhasil dihapus',
            'data'      => $pelanggan,
        ], 200);
    }

    public function getPelangganUlangTahun()
    {
        try {
            $today = now();
            $data = Pelanggan::whereMonth('tanggal', $today->month)
                ->whereDay('tanggal', $today->day)
                ->where('status', 1)
                ->get(['id', 'nama', 'kontak', 'tanggal']);

            return response()->json([
                'success' => true,
                'data'    => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
