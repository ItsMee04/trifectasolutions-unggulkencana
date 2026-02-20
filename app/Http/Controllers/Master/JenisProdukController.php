<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\JenisProduk;
use Illuminate\Http\Request;

class JenisProdukController extends Controller
{
    public function getJenisProduk()
    {
        $data = JenisProduk::where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis produk tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeJenisProduk(Request $request)
    {
        $request->validate([
            'jenis'   => 'required|string|max:100',
            'image'   => 'nullable|mimes:jpeg,png,jpg|max:2048',
        ]);

        $image = '';
        if ($request->hasFile('image')) {
            $extension = $request->file('image')->getClientOriginalExtension();
            $image = strtoupper($request->jenis) . '.' . $extension;
            $request->file('image')->storeAs('images/jenisproduk', $image, 'public');
            $request['image'] = $image;
        }

        $data = JenisProduk::create([
            'jenis'     => strtoupper($request->jenis),
            'image'     => $image
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateJenisProduk(Request $request)
    {
        $request->validate([
            'jenis'   => 'required|string|max:100',
            'image'   => 'nullable|mimes:jpeg,png,jpg|max:2048',
        ]);

        $jenisproduk = JenisProduk::find($request->id);

        if (!$jenisproduk) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis produk tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $image = $jenisproduk->image;
        if ($request->hasFile('image')) {
            $extension = $request->file('image')->getClientOriginalExtension();
            $image = strtoupper($request->jenis) . '.' . $extension;
            $request->file('image')->storeAs('images/jenisproduk', $image, 'public');
            $request['image'] = $image;
        }

        $jenisproduk->update([
            'jenis'     => strtoupper($request->jenis),
            'image'     => $image
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil diupdate',
            'data'      => $jenisproduk,
        ], 200);
    }

    public function deleteJenisProduk(Request $request)
    {
        $jenisproduk = JenisProduk::find($request->id);

        if (!$jenisproduk) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data jenis produk tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $jenisproduk->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data jenis produk berhasil dihapus',
            'data'      => $jenisproduk,
        ], 200);
    }
}
