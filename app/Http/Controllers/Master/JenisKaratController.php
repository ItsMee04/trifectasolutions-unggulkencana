<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\JenisKarat;
use Illuminate\Http\Request;

class JenisKaratController extends Controller
{
    public function getJenisKarat()
    {
        $data = JenisKarat::with(['karat'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis karat tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis karat berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeJenisKarat(Request $request)
    {
        $request->validate([
            'karat'   => 'required|exists:karat,id',
            'jenis'      => 'required|string',
        ]);

        $data = JenisKarat::create([
            'karat_id'  => $request->karat,
            'jenis'     => strtoupper($request->jenis),
            'status'    => 1,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis karat berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateJenisKarat(Request $request)
    {
        $request->validate([
            'karat'   => 'required|exists:karat,id',
            'jenis'      => 'required|string',
        ]);

        $jeniskarat = JenisKarat::find($request->id);

        if (!$jeniskarat) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis karat tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $jeniskarat->update([
            'karat_id'   => $request->karat,
            'jenis'      => strtoupper($request->jenis)
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis karat berhasil diupdate',
            'data'      => $jeniskarat,
        ], 200);
    }

    public function deleteJenisKarat(Request $request)
    {
        $jeniskarat = JenisKarat::find($request->id);

        if (!$jeniskarat) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis karat tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $jeniskarat->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis karat berhasil dihapus',
            'data'      => $jeniskarat,
        ], 200);
    }
}
