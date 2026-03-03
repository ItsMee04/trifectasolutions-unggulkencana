<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Models\Transaksi\Pembelian;
use App\Models\Transaksi\PembelianDetail;
use App\Models\Transaksi\Perbaikan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PerbaikanController extends Controller
{
    public function getPerbaikan()
    {
        $data = Perbaikan::with(['produk', 'kondisi'])->where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data perbaikan tidak ditemukan',
                'data'      => []
            ], 400);
        }

        return response()->json([
            'status'        => true,
            'message'       => 'Data perbaikan berhasil ditemukan',
            'data'          => $data,
        ], 200);
    }

    public function finalPerbaikan(Request $request)
    {
        $request->validate([
            // Pastikan validasi menggunakan kolom yang benar,
            // biasanya primary key adalah 'id' atau jika memang 'kode' gunakan 'kode'
            'kode' => 'required|exists:perbaikan,id',
        ]);

        DB::beginTransaction();
        try {
            // Mencari data perbaikan
            $perbaikan = Perbaikan::findOrFail($request->kode);

            // 1. Update data Perbaikan
            $perbaikan->keterangan    = "Produk selesai diperbaiki";
            $perbaikan->tanggalkeluar = Carbon::now();
            $perbaikan->status        = 2; // Status selesai
            $perbaikan->save();

            // 2. Aktifkan Master Produk berdasarkan produk_id dari data perbaikan
            // Mengasumsikan status '1' adalah aktif
            Produk::where('id', $perbaikan->produk_id)->update([
                'status' => 1
            ]);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Final Perbaikan berhasil dan produk telah diaktifkan kembali'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memfinal perbaikan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function batalPerbaikan(Request $request)
    {
        $request->validate([
            'kode' => 'required|exists:perbaikan,id' // ID primary key dari tabel perbaikan
        ]);

        DB::beginTransaction();
        try {
            // 1. Cek data Perbaikan
            $perbaikan = Perbaikan::findOrFail($request->kode);

            // 2. Cari Detail Pembelian terkait untuk mendapatkan nominal yang harus dikembalikan
            $pembelianDetail = PembelianDetail::where('produk_id', $perbaikan->produk_id)
                ->where('status', '!=', 0)
                ->first();

            if ($pembelianDetail) {
                // Ambil nominal total dari detail yang dibatalkan
                $nominalRefund = $pembelianDetail->total;
                $kodeNota = $pembelianDetail->kode;

                // 3. Update status Tabel Pembelian (Header)
                $pembelian = Pembelian::where('kode', $kodeNota)->first();
                if ($pembelian) {
                    $pembelian->update(['status' => 0]);
                }

                // 4. Update status Tabel PembelianDetail
                $pembelianDetail->update(['status' => 0]);

                // --- LOGIKA REFUND SALDO ---

                // 5. Cari Saldo Aktif (Kembalikan ke rekening yang statusnya 1)
                $saldoAktif = DB::table('saldo')->where('status', 1)->first();

                if ($saldoAktif && $nominalRefund > 0) {
                    // Tambah kembali total saldo di tabel rekening
                    DB::table('saldo')->where('id', $saldoAktif->id)->increment('total', $nominalRefund);

                    // Catat di Mutasi Saldo sebagai uang MASUK
                    DB::table('mutasisaldo')->insert([
                        'saldo_id'   => $saldoAktif->id,
                        'tanggal'    => now()->format('Y-m-d'),
                        'keterangan' => "PEMBATALAN Pembelian & Perbaikan. Kode Nota: " . $kodeNota,
                        'jenis'      => 'MASUK', // Uang kembali ke toko
                        'jumlah'     => $nominalRefund,
                        'oleh'       => Auth::id(),
                        'status'     => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // 6. Update status Tabel Perbaikan
            $perbaikan->update(['status' => 0]);

            // 7. Update status Tabel Produk
            $produk = Produk::find($perbaikan->produk_id);
            if ($produk) {
                $produk->update(['status' => 0]);
            }

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Pembatalan Berhasil.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal membatalkan & refund: ' . $e->getMessage()
            ], 500);
        }
    }
}
