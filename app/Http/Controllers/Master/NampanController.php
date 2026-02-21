<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Nampan;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NampanController extends Controller
{
    public function getNampan()
    {
        $data = Nampan::with(['jenisproduk'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data nampan tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan berhasil ditemukan',
            'data'      => $data,
        ], 200);
    }

    public function storeNampan(Request $request)
    {
        $request->validate([
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'nampan'        => 'required|string'
        ]);

        $data = Nampan::create([
            'jenisproduk_id'    => $request->jenisproduk,
            'tanggal'           => Carbon::now(),
            'nampan'            => strtoupper($request->nampan),
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateNampan(Request $request)
    {
        $request->validate([
            'jenisproduk'   => 'required|exists:jenisproduk,id',
            'nampan'        => 'required|string'
        ]);

        $nampan = Nampan::find($request->id);

        if (!$nampan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data nampan tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $nampan->update([
            'jenisproduk_id'    => $request->jenisproduk,
            'tanggal'           => Carbon::now(),
            'nampan'            => strtoupper($request->nampan),
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan berhasil diupdate',
            'data'      => $nampan,
        ], 200);
    }

    public function deleteNampan(Request $request)
    {
        $nampan = Nampan::find($request->id);

        if (!$nampan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data nampan tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $nampan->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan berhasil dihapus',
            'data'      => $nampan,
        ], 200);
    }
}
