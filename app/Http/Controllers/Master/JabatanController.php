<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    public function getJabatan()
    {
        $data = Jabatan::where('status',1)->get();

        if($data->isEmpty()){
            return response()->json([
                'status' => false,
                'message' => 'Data jabatan tidak ditemukan',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data jabatan berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function storeJabatan(Request $request)
    {
        $request->validate([
            'jabatan' => 'required|string|max:100',
        ]);

        $jabatan = Jabatan::create([
            'jabatan' => $request->jabatan,
            'status' => 1
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data jabatan berhasil disimpan',
            'data' => $jabatan
        ], 201);
    }

    public function updateJabatan(Request $request)
    {
        $request->validate([
            'jabatan' => 'required|string|max:100',
        ]);

        $jabatan = Jabatan::find($request->id);

        if (!$jabatan) {
            return response()->json([
                'status' => false,
                'message' => 'Data jabatan tidak ditemukan',
                'data' => []
            ], 404);
        }

        $jabatan->update([
            'jabatan' => $request->jabatan,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data jabatan berhasil diupdate',
            'data' => $jabatan
        ], 200);
    }

    public function deleteJabatan(Request $request)
    {
        $jabatan = Jabatan::find($request->id);

        if (!$jabatan) {
            return response()->json([
                'status' => false,
                'message' => 'Data jabatan tidak ditemukan',
                'data' => []
            ], 404);
        }

        $jabatan->update([
            'status' => 0
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data jabatan berhasil dihapus',
            'data' => $jabatan
        ], 200);
    }
}
