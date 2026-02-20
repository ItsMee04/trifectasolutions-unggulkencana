<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Harga;
use Illuminate\Http\Request;

class HargaController extends Controller
{
    public function getHarga()
    {
        $data = Harga::with(['karat', 'jeniskarat'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data harga tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data harga berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeHarga(Request $request)
    {
        $request->validate([
            'karat'   => 'required|exists:karat,id',
            'jenis'   => 'required|exists:jeniskarat,id',
            'harga'   => 'required|numeric',
        ]);

        $data = Harga::create([
            'karat_id'      => $request->karat,
            'jeniskarat_id' => $request->jenis,
            'harga'         => $request->harga
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data Harga berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateHarga(Request $request)
    {
        $request->validate([
            'karat'   => 'required|exists:karat,id',
            'jenis'   => 'required|exists:jeniskarat,id',
            'harga'   => 'required|numeric'
        ]);

        $harga = Harga::find($request->id);

        if (!$harga) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data harga tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $harga->update([
            'karat_id'      => $request->karat,
            'jeniskarat_id' => $request->jenis,
            'harga'         => $request->harga
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data harga berhasil diupdate',
            'data'      => $harga,
        ], 200);
    }

    public function deleteHarga(Request $request)
    {
        $harga = Harga::find($request->id);

        if (!$harga) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data harga tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $harga->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data harga berhasil dihapus',
            'data'      => $harga,
        ], 200);
    }
}
