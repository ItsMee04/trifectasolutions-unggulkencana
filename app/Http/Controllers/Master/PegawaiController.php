<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    public function getPegawai()
    {
        $data = Pegawai::with(['jabatan'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Data pegawai tidak ditemukan',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data pegawai berhasil diambil',
            'data' => $data
        ], 200);
    }

    public function storePegawai(Request $request)
    {
        $request->validate([
            'nip'           => 'required|string|max:100|unique:pegawai',
            'nama'          => 'required|string|max:100',
            'alamat'        => 'nullable|string',
            'kontak'        => 'nullable|string|max:14',
            'jabatan'       => 'required|exists:jabatan,id',
            'image'         => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $image = '';
        if ($request->hasFile('image')) {
            $extension = $request->file('image')->getClientOriginalExtension();
            $image = $request->nip . '.' . $extension;
            $request->file('image')->storeAs('images/pegawai', $image, 'public');
            $request['image'] = $image;
        }

        $pegawai = Pegawai::create([
            'nip'           => $request->nip,
            'nama'          => strtoupper($request->nama),
            'alamat'        => strtoupper($request->alamat),
            'kontak'        => $request->kontak,
            'jabatan_id'    => $request->jabatan,
            'image'         => $image,
            'status'        => 1
        ]);

        if ($pegawai) {
            User::create([
                'pegawai_id'    => $pegawai->id,
                'status'        => 1
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data pegawai berhasil disimpan',
            'data' => $pegawai
        ], 201);
    }

    public function updatePegawai(Request $request)
    {
        $request->validate([
            'id'            => 'required|exists:pegawai,id',
            'nip'           => 'required|string|max:100|unique:pegawai,nip,' . $request->id,
            'nama'          => 'required|string|max:100',
            'alamat'        => 'nullable|string',
            'kontak'        => 'nullable|string|max:14',
            'jabatan'       => 'required|exists:jabatan,id',
            'image'         => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $pegawai = Pegawai::find($request->id);

        if (!$pegawai) {
            return response()->json([
                'status' => false,
                'message' => 'Data pegawai tidak ditemukan',
                'data' => []
            ], 404);
        }

        $image = $pegawai->image;
        if ($request->hasFile('image')) {
            $extension = $request->file('image')->getClientOriginalExtension();
            $image = $request->nip . '.' . $extension;
            $request->file('image')->storeAs('images/pegawai', $image, 'public');
            $request['image'] = $image;
        }

        $pegawai->update([
            'nip'           => $request->nip,
            'nama'          => strtoupper($request->nama),
            'alamat'        => strtoupper($request->alamat),
            'kontak'        => $request->kontak,
            'jabatan_id'    => $request->jabatan,
            'image'         => $image,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Data pegawai berhasil diupdate',
            'data' => $pegawai
        ], 200);
    }

    public function deletePegawai(Request $request)
    {
        $pegawai = Pegawai::find($request->id);

        if (!$pegawai) {
            return response()->json([
                'status' => false,
                'message' => 'Data pegawai tidak ditemukan',
                'data' => []
            ], 404);
        }

        $deletepegawai = $pegawai->update([
            'status' => 0
        ]);

        if ($deletepegawai) {
            User::where('pegawai_id', $request->id)
                ->update([
                    'status' => 0
                ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Data pegawai berhasil dihapus',
            'data' => []
        ], 200);
    }
}
