<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\NampanProduk;
use App\Models\Master\Produk;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NampanProdukController extends Controller
{
    public function getNampanProduk()
    {
        $data = NampanProduk::with(['nampan', 'produk', 'users'])->where('status', 1)->get();

        if ($data->isEmpty()) {
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

    public function getNampanProdukByNampan(Request $request)
    {
        $data = NampanProduk::with(['nampan', 'produk', 'users'])
            ->where('nampan_id', $request->id)
            ->where('status', 1)->get();

        if ($data->isEmpty()) {
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

    public function getProdukByJenisNampan(Request $request)
    {
        $data = Produk::with(['jenisproduk', 'karat', 'jeniskarat', 'harga', 'kondisi'])
            ->where('status', 1)
            ->where('jenisproduk_id', $request->jenisproduk)
            ->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data produk tidak ditemukan',
                'data'      => [],
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data produk berhasil ditemukan',
            'data'      => $data,
        ], 200);
    }

    public function storeNampanProduk(Request $request)
    {
        // 1. Validasi Input Dasar
        $request->validate([
            'nampan_id'   => 'required|exists:nampan,id',
            'produk_id'   => 'required|array',
            'produk_id.*' => 'required|exists:produk,id'
        ]);

        DB::beginTransaction();

        try {
            $nampanId = $request->nampan_id;
            $produkIds = $request->produk_id;
            $userId = Auth::id();
            $sekarang = Carbon::now();

            // 2. VALIDASI TAMBAHAN: Cek apakah produk sedang aktif di nampan MANAPUN
            // Kita mencari record dengan produk_id terkait yang statusnya masih 1 (Aktif)
            $activeInOtherNampan = NampanProduk::with('nampan')
                ->whereIn('produk_id', $produkIds)
                ->where('status', 1)
                ->get();

            if ($activeInOtherNampan->isNotEmpty()) {
                // Mengambil nama nampan dan nama produk untuk pesan error yang informatif
                // (Asumsi Anda memiliki relasi 'produk' dan 'nampan' di model NampanProduk)
                $firstConflict = $activeInOtherNampan->first();

                // Jika produk aktif di nampan yang BERBEDA dengan nampan_id saat ini
                // Atau jika Anda ingin benar-benar saklek tidak boleh double input sama sekali:
                return response()->json([
                    'status'  => false,
                    'message' => "Gagal! Produk masih aktif di nampan: " . ($firstConflict->nampan->nampan ?? 'Lain')
                ], 400);
            }

            // 3. Filter: Karena sudah dicek di atas, maka semua $produkIds adalah baru/tersedia
            // Namun jika Anda ingin tetap menggunakan filter array_diff untuk keamanan:
            $newProdukIds = $produkIds;

            // 4. Siapkan data untuk Batch Insert
            $dataToInsert = [];
            foreach ($newProdukIds as $id) {
                $dataToInsert[] = [
                    'nampan_id'  => $nampanId,
                    'produk_id'  => $id,
                    'jenis'      => 'MASUK',
                    'tanggal'    => $sekarang->format('Y-m-d'),
                    'oleh'       => $userId,
                    'status'     => 1,
                    'created_at' => $sekarang,
                    'updated_at' => $sekarang,
                ];
            }

            // 5. Eksekusi
            NampanProduk::insert($dataToInsert);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => count($newProdukIds) . " produk berhasil ditambahkan ke nampan.",
                'data'    => [
                    'nampan_id' => $nampanId,
                    'inserted_count' => count($newProdukIds)
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function pindahNampanProduk(Request $request)
    {
        $request->validate([
            'nampan'   => 'required|exists:nampan,id',
            'produk' => 'required|exists:produk,id'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Ambil data
                $recordAktif = NampanProduk::findOrFail($request->produk);
                $tglSekarang = now()->toDateString();

                // 2. Matikan yang lama
                $recordAktif->update(['status' => 0]);

                // 3. Catatan History Keluar
                NampanProduk::create([
                    'nampan_id' => $recordAktif->nampan_id,
                    'produk_id' => $recordAktif->produk_id,
                    'jenis'     => 'KELUAR',
                    'tanggal'   => $tglSekarang,
                    'status'    => 0,
                    'oleh'      => Auth::user()->id
                ]);

                // 4. Catatan Masuk Baru
                NampanProduk::create([
                    'nampan_id' => $request->nampan,
                    'produk_id' => $recordAktif->produk_id,
                    'jenis'     => 'MASUK',
                    'tanggal'   => $tglSekarang,
                    'status'    => 1,
                    'oleh'      => Auth::user()->id
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Produk berhasil dipindahkan.'
                ]);
            });
        } catch (\Exception $e) {
            // Jika ada satu saja yang gagal, semua langkah di atas BATAL (ROLLBACK)
            return response()->json([
                'status' => false,
                'message' => 'Gagal pindah: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteNampanProduk(Request $request)
    {
        $request->validate([
            'produk' => 'required|exists:nampanproduk,id'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Ambil record yang sedang aktif saat ini
                $recordAktif = NampanProduk::findOrFail($request->produk);
                $tglSekarang = now()->toDateString();

                // 2. Update status record aktif menjadi 0 (Tutup buku)
                $recordAktif->update([
                    'status' => 0
                ]);

                // 3. Insert record baru sebagai bukti riwayat KELUAR
                NampanProduk::create([
                    'nampan_id' => $recordAktif->nampan_id,
                    'produk_id' => $recordAktif->produk_id,
                    'jenis'     => 'KELUAR',
                    'tanggal'   => $tglSekarang,
                    'status'    => 0, // Status 0 karena barang sudah tidak ada di nampan
                    'oleh'      => Auth::user()->id
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Produk berhasil dikeluarkan dari nampan (History tersimpan).'
                ]);
            });
        } catch (\Exception $e) {
            // Jika terjadi error di tengah jalan, database akan ROLLBACK otomatis
            return response()->json([
                'status' => false,
                'message' => 'Gagal menghapus produk: ' . $e->getMessage()
            ], 500);
        }
    }
}
