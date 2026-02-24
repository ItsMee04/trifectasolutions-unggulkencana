<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Keuangan\Saldo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SaldoController extends Controller
{
    public function getSaldo()
    {
        $data = Saldo::all();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data saldo tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data saldo berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeSaldo(Request $request)
    {
        $request->validate([
            'rekening' => 'required|string|max:100',
        ]);

        // Menggunakan Transaction untuk keamanan data
        $data = DB::transaction(function () use ($request) {
            // 1. Buat rekening baru dengan status aktif (1)
            $newSaldo = Saldo::create([
                'rekening' => strtoupper($request->rekening),
                'oleh'     => Auth::user()->id,
                'status'   => 1, // Pastikan defaultnya aktif
            ]);

            // 2. Nonaktifkan (set status 0) semua rekening selain yang baru saja dibuat
            Saldo::where('id', '!=', $newSaldo->id)
                ->where('status', 1)
                ->update(['status' => 0]);

            return $newSaldo;
        });

        return response()->json([
            'status'  => true,
            'message' => 'Data saldo berhasil disimpan dan rekening lainnya telah dinonaktifkan',
            'data'    => $data,
        ], 201);
    }

    public function updateSaldo(Request $request)
    {
        $request->validate([
            'id'       => 'required|exists:saldo,id',
            'rekening' => 'required|string|max:100',
            'status'   => 'required|in:0,1', // Validasi status harus 0 atau 1
        ]);

        try {
            $data = DB::transaction(function () use ($request) {
                $saldo = Saldo::findOrFail($request->id);

                // Update data rekening tersebut
                $saldo->update([
                    'rekening' => strtoupper($request->rekening),
                    'status'   => $request->status,
                    'oleh'     => Auth::user()->id,
                ]);

                // LOGIKA KRUSIAL: Jika status diupdate ke AKTIF (1)
                // Maka nonaktifkan semua record LAINNYA.
                if ($request->status == 1) {
                    Saldo::where('id', '!=', $saldo->id)
                        ->where('status', 1)
                        ->update(['status' => 0]);
                }

                return $saldo;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Data saldo berhasil diupdate',
                'data'    => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSaldo(Request $request)
    {
        $saldo = Saldo::find($request->id);

        if (!$saldo) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data saldo tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        $saldo->update([
            'status'    => 0,
        ]);

        return response()->json([
            'status'    => true,
            'message'   => 'Data saldo berhasil dihapus',
            'data'      => $saldo,
        ], 200);
    }
}
