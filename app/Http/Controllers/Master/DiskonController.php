<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Diskon;
use Illuminate\Http\Request;

class DiskonController extends Controller
{
    public function getDiskon()
    {
        $data = Diskon::where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data diskon tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data diskon berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeDiskon(Request $request)
    {
        $request->validate([
            'diskon'   => 'required|string|max:100',
            'nilai'    => 'required|string|max:100',
        ]);

        $data = Diskon::create([
            'diskon'    => strtoupper($request->diskon),
            'nilai'     => $request->nilai,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data diskon berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateDiskon(Request $request)
    {
        $request->validate([
            'diskon'   => 'required|string|max:100',
            'nilai'    => 'required|string|max:100',
        ]);

        $diskon = Diskon::find($request->id);

        if (!$diskon) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data diskon tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $diskon->update([
            'diskon'    => strtoupper($request->diskon),
            'nilai'     => $request->nilai,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data diskon berhasil diupdate',
            'data'      => $diskon,
        ], 200);
    }

    public function deleteDiskon(Request $request)
    {
        $diskon = Diskon::find($request->id);

        if (!$diskon) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data diskon tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $diskon->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data diskon berhasil dihapus',
            'data'      => $diskon,
        ], 200);
    }
}
