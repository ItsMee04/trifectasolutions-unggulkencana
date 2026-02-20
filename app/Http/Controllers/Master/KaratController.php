<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Karat;
use Illuminate\Http\Request;

class KaratController extends Controller
{
    public function getKarat() {
        $data = Karat::where('status', 1)->get();

        if($data->isEmpty()){
            return response()->json([
                'status'    => false,
                'message'   => 'Data karat tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data karat berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeKarat(Request $request) {
        $request->validate([
            'karat'   => 'required|string|max:100',
        ]);

        $data = Karat::create([
            'karat'     => $request->karat,
            'status'    => 1,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data karat berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateKarat(Request $request) {
        $request->validate([
            'karat'   => 'required|string|max:100',
        ]);

        $karat = Karat::find($request->id);

        if(!$karat) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data karat tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $karat->update([
            'karat'   => $request->karat,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data karat berhasil diupdate',
            'data'      => $karat,
        ], 200);
    }

    public function deleteKarat(Request $request) {
        $karat = Karat::find($request->id);

        if(!$karat) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data karat tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $karat->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data karat berhasil dihapus',
            'data'      => $karat,
        ], 200);
    }
}
