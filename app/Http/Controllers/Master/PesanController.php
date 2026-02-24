<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Pesan;
use Illuminate\Http\Request;

class PesanController extends Controller
{
    public function getPesan()
    {
        $data = Pesan::where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pesan tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data pesan berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storePesan(Request $request)
    {
        $request->validate([
            'judul'   => 'required|string|max:100',
            'pesan'   => 'required|string|max:100',
        ]);

        try {
            $pesan = Pesan::create([
                'judul'     => strtoupper($request->judul),
                'pesan'     => strtoupper($request->pesan),
                'status'    => 1
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Pesan berhasil ditambahkan',
                'data' => $pesan
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function updatePesan(Request $request)
    {
        $request->validate([
            'judul'   => 'required|string|max:100',
            'pesan'   => 'required|string|max:100',
        ]);

        $pesan = Pesan::find($request->id);

        if (!$pesan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pesan tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $pesan->update([
            'judul'     => strtoupper($request->judul),
            'pesan'     => strtoupper($request->pesan),
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data pesan berhasil diupdate',
            'data'      => $pesan,
        ], 200);
    }

    public function deletePesan(Request $request)
    {
        $pesan = Pesan::find($request->id);

        if (!$pesan) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data pesan tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $pesan->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data pesan berhasil dihapus',
            'data'      => $pesan,
        ], 200);
    }
}
