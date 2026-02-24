<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Keuangan\MutasiSaldo;
use App\Models\Keuangan\Saldo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MutasiSaldoController extends Controller
{
    public function getMutasiSaldo()
    {
        $data = MutasiSaldo::with(['saldo'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data mutasi saldo tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data mutasi saldo berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function storeMutasiSaldo(Request $request)
    {
        $request->validate([
            'saldo'         => 'required|exists:saldo,id',
            'tanggal'       => 'required|date',
            'keterangan'    => 'nullable|string',
            'jenis'         => 'required',
            'jumlah'        => 'required|integer',
        ]);

        $rekening = Saldo::where('id', $request->rekening)->first();

        if (!$rekening) {
            return response()->json([
                'status'    => false,
                'message'   => "Data rekening tidak ditemukan"
            ], 400);
        }

        $data = MutasiSaldo::create([
            'saldo_id'      => $request->rekening,
            'tanggal'       => $request->tanggal,
            'keterangan'    => $request->keterangan,
            'jenis'         => $request->jenis,
            'jumlah'        => $request->jumlah,
            'oleh'          => Auth::user()->id,
        ]);

        if ($data) {
            if ($request->jenis === "MASUK") {
                $rekening->total = $rekening->total + $request->jumlah;
                $rekening->save();
            } elseif ($request->jenis === "KELUAR") {
                $rekening->total = $rekening->total - $request->jumlah;
                $rekening->save();
            }
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data mutasi saldo berhasil disimpan',
            'data'      => $data,
        ], 201);
    }

    public function updateDiskon(Request $request)
    {
        $request->validate([
            'diskon'   => 'required|string|max:100',
            'nilai'    => 'required|string|max:100',
        ]);

        $mutasisaldo = MutasiSaldo::find($request->id);

        if (!$mutasisaldo) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data mutasi saldo tidak ditemukan',
                'data'      => [],
            ], 400);
        }

        // 2. Ambil data rekening (Saldo) terkait
        $rekening = Saldo::where('id', $mutasisaldo->saldo)->first();

        if (!$rekening) {
            return response()->json([
                'status'    => false,
                'message'   => "Data rekening tidak ditemukan"
            ], 400);
        }

        // 3. REVERT: Kembalikan saldo ke kondisi awal (sebelum mutasi lama dihitung)
        if ($mutasisaldo->jenis === "MASUK") {
            $rekening->total = $rekening->total - $mutasisaldo->jumlah;
        } elseif ($mutasisaldo->jenis === "KELUAR") {
            $rekening->total = $rekening->total + $mutasisaldo->jumlah;
        }

        // 4. Update data Mutasi dengan data baru dari request
        $mutasisaldo->tanggal    = $request->tanggal;
        $mutasisaldo->keterangan = $request->keterangan;
        $mutasisaldo->jenis      = $request->jenis;
        $mutasisaldo->jumlah     = $request->jumlah;
        $mutasisaldo->oleh       = Auth::user()->id;
        $mutasisaldo->save();

        // 5. APPLY: Hitung ulang saldo berdasarkan jenis mutasi yang baru diupdate
        if ($request->jenis === "MASUK") {
            $rekening->total = $rekening->total + $request->jumlah;
        } elseif ($request->jenis === "KELUAR") {
            $rekening->total = $rekening->total - $request->jumlah;
        }

        // Simpan perubahan total saldo di tabel Rekening/Saldo
        $rekening->save();


        return response()->json([
            'status'    => true,
            'message'   => 'Data mutasi saldo berhasil diupdate',
            'data'      => $mutasisaldo,
        ], 200);
    }

    public function deleteDiskon(Request $request)
    {
        $mutasisaldo = MutasiSaldo::find($request->id);

        if (!$mutasisaldo) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data mutasi tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        // 2. Ambil data rekening terkait
        $rekening = Saldo::where('id', $mutasisaldo->saldo)->first();

        if ($rekening) {
            // 3. REVERT: Balikkan saldo karena transaksi dibatalkan
            if ($mutasisaldo->jenis === "MASUK") {
                $rekening->total -= $mutasisaldo->jumlah;
            } elseif ($mutasisaldo->jenis === "KELUAR") {
                $rekening->total += $mutasisaldo->jumlah;
            }
            $rekening->save();
        }

        // 4. Ubah status menjadi 0 alih-alih delete
        $mutasisaldo->status = 0;
        $mutasisaldo->save();

        return response()->json([
            'status'    => true,
            'message'   => 'Data mutasi saldo berhasil dihapus',
            'data'      => $mutasisaldo,
        ], 200);
    }
}
