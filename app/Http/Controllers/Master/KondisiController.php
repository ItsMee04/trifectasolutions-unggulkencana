<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Kondisi;
use Illuminate\Http\Request;

class KondisiController extends Controller
{
    public function getKondisi() {
        $data = Kondisi::where('status', 1)->get();

        if($data->isEmpty()){
            return response()->json([
                'status'    => false,
                'message'   => 'Data kondisi tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data kondisi berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeKondisi(Request $request) {
        $request->validate([
            'kondisi'   => 'required|string|max:100',
        ]);

        $data = Kondisi::create([
            'kondisi'   => strtoupper($request->kondisi),
            'status'    => 1,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data kondisi berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateKondisi(Request $request) {
        $request->validate([
            'kondisi'   => 'required|string|max:100',
        ]);

        $kondisi = Kondisi::find($request->id);

        if(!$kondisi) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data kondisi tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $kondisi->update([
            'kondisi'   => strtoupper($request->kondisi),
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data kondisi berhasil diupdate',
            'data'      => $kondisi,
        ], 200);
    }

    public function deleteKondisi(Request $request) {
        $kondisi = Kondisi::find($request->id);

        if(!$kondisi) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data kondisi tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $kondisi->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data kondisi berhasil dihapus',
            'data'      => $kondisi,
        ], 200);
    }
}
