<?php

namespace App\Http\Controllers\Stok;

use App\Http\Controllers\Controller;
use App\Models\Stok\Stok;
use App\Services\StokService;
use Illuminate\Http\Request;

class StokController extends Controller
{
    protected $stokService;

    public function __construct(StokService $stokService)
    {
        $this->stokService = $stokService;
    }

    public function getPeriodeStokOpname()
    {
        $data = Stok::where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data periode stok opname tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data periode stok berhasil ditemukan',
            'data'      => $data
        ], 200);
    }

    public function storePeriodeStokOpname(Request $request)
    {

    }
}
