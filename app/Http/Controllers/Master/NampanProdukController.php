<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\NampanProduk;
use Illuminate\Http\Request;

class NampanProdukController extends Controller
{
    public function getNampanProduk()
    {
        $data = NampanProduk::with(['nampan','produk','users'])->where('status', 1)->get();

        if($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data nampan produk tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data nampan produk berhasil ditemukan',
            'data'      => $data,
        ], 200);
    }

    public function storeNampanProduk(Request $request)
    {

    }
}
