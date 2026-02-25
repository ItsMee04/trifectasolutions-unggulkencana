<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Models\Transaksi\Offtake;
use App\Models\Transaksi\OfftakeDetail;
use App\Services\OfftakeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OfftakeController extends Controller
{
    protected $offtakeService;

    // Inject service melalui constructor
    public function __construct(OfftakeService $offtakeService)
    {
        $this->offtakeService = $offtakeService;
    }

    public function getKodeTransaksi()
    {
        try {
            // 1. Cari apakah ada transaksi milik user login yang statusnya masih DRAFT (1)
            $transaksiAktif = Offtake::where('oleh', Auth::id())
                ->where('status', 1)
                ->latest()
                ->first();

            if ($transaksiAktif) {
                // Jika ada, gunakan kode yang sudah ada di database
                $kode = $transaksiAktif->kode;
                $message = 'Menggunakan kode transaksi aktif';
            } else {
                // Jika tidak ada, barulah panggil service untuk generate nomor urut baru
                $kode = $this->offtakeService->generateKodeTransaksi();
                $message = 'Kode transaksi baru berhasil di-generate';
            }

            return response()->json([
                'status'  => true,
                'message' => $message,
                'kode'    => $kode
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal generate kode: ' . $e->getMessage()], 500);
        }
    }

    public function storeProdukToOfftakeDetail(Request $request)
    {
        $request->validate([
            'kode' => 'required',
            'items' => 'required|array|min:1',
            'items.*.produk_id' => 'required|exists:produk,id',
            'items.*.harga' => 'required|numeric',
            'items.*.berat' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            // 1. Header Offtake (Identitas Dasar)
            $offtake = Offtake::firstOrCreate(
                ['kode' => $request->kode],
                [
                    'tanggal'    => now(),
                    'suplier_id' => null,
                    'oleh'       => Auth::id(),
                    'status'     => 1,
                ]
            );

            $items = $request->items;
            $failedItems = []; // Untuk mencatat produk yang gagal karena duplikat

            foreach ($items as $item) {
                // 2. VALIDASI DUPLIKASI:
                // Cek apakah produk_id ini sudah ada di offtakedetail manapun yang statusnya masih aktif (1)
                $existingDetail = OfftakeDetail::where('produk_id', $item['produk_id'])
                    ->where('status', 1)
                    ->first();

                if ($existingDetail) {
                    // Ambil info produk untuk pesan error yang lebih jelas
                    $namaProduk = DB::table('produk')->where('id', $item['produk_id'])->value('nama');
                    $failedItems[] = "Produk [$namaProduk] sudah ada di daftar transaksi (Kode: {$existingDetail->kode})";
                    continue; // Skip produk ini, lanjut ke item berikutnya
                }

                // 3. Simpan ke OfftakeDetail jika lolos validasi
                $totalHargaItem = $item['harga'] * $item['berat'];

                $detail = new OfftakeDetail();
                $detail->kode      = $request->kode;
                $detail->produk_id = $item['produk_id'];
                $detail->hargajual = $item['harga'];
                $detail->berat     = $item['berat'];
                $detail->karat     = $item['karat'] ?? 0;
                $detail->lingkar   = $item['lingkar'] ?? 0;
                $detail->panjang   = $item['panjang'] ?? 0;
                $detail->total     = $totalHargaItem;
                $detail->terbilang = $this->offtakeService->terbilang($totalHargaItem) . " rupiah";
                $detail->oleh      = Auth::id();
                $detail->status    = 1;
                $detail->save();
            }

            // 4. Response Logic
            if (count($failedItems) === count($items)) {
                // Jika SEMUA item yang dikirim ternyata duplikat
                DB::rollBack();
                return response()->json([
                    'status'  => false,
                    'message' => 'Semua produk yang dipilih sudah ada di daftar transaksi aktif.',
                    'errors'  => $failedItems
                ], 400);
            }

            DB::commit();

            $msg = 'Produk berhasil ditambahkan.';
            if (count($failedItems) > 0) {
                $msg .= ' Namun ' . count($failedItems) . ' produk dilewati karena sudah ada di daftar.';
            }

            return response()->json([
                'status'  => true,
                'message' => $msg,
                'failed'  => $failedItems,
                'data'    => $offtake
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memproses: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOfftakeDetail()
    {
        $data = OfftakeDetail::with(['produk'])->where('status', 1)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data keranjang tidak ditemukan',
                'data'      => []
            ], 404);
        }

        return response()->json([
            'status'    => true,
            'message'   => 'Data keranjang berhasil diambil',
            'data'      => $data
        ], 200);
    }

    public function batalOfftakeDetail(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:offtakedetail,id'
        ]);

        DB::beginTransaction();
        try {
            $detail = OfftakeDetail::where('id', $request->id)
                ->where('status', 1)
                ->firstOrFail();

            $kodeOfftake = $detail->kode;

            // 1. Ubah status detail menjadi 0
            $detail->update([
                'status' => 0,
                'oleh'   => Auth::id()
            ]);

            // 2. Cek apakah masih ada produk lain yang AKTIF di kode ini
            $sisaProdukAktif = OfftakeDetail::where('kode', $kodeOfftake)
                ->where('status', 1)
                ->count();

            $offtake = Offtake::where('kode', $kodeOfftake)->first();

            if ($offtake) {
                if ($sisaProdukAktif > 0) {
                    // KONDISI A: Masih ada produk lain, hanya update total
                    $newTotal = OfftakeDetail::where('kode', $kodeOfftake)
                        ->where('status', 1)
                        ->sum('total');

                    $offtake->update([
                        'total'      => $newTotal,
                        'hargatotal' => $newTotal,
                        'terbilang'  => $this->offtakeService->terbilang($newTotal) . " rupiah",
                    ]);
                } else {
                    // KONDISI B: Sudah tidak ada produk aktif (Kosong)
                    // Maka set total ke 0 dan status header ke 0 (Batal/Selesai Kosong)
                    $offtake->update([
                        'total'      => 0,
                        'hargatotal' => 0,
                        'terbilang'  => 'rupiah',
                        'status'     => 0, // Header ikut menjadi non-aktif
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => $sisaProdukAktif > 0
                    ? 'Produk berhasil dihapus.'
                    : 'Produk terakhir dihapus, transaksi menjadi kosong.',
                'sisa_item' => $sisaProdukAktif
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal membatalkan produk: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentOfftake(Request $request)
    {
        $request->validate([
            'kode'       => 'required',
            'suplier_id' => 'required',
            'total'      => 'required|numeric',
            'keterangan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // 1. Cari Saldo Aktif (Tujuan Penerimaan Dana)
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if (!$saldoAktif) {
                throw new \Exception("Tidak ada rekening saldo aktif untuk menerima pembayaran.");
            }

            // 2. Cari Header Offtake
            $offtake = Offtake::where('kode', $request->kode)->where('status', 1)->firstOrFail();

            // 3. Ambil Detail Produk
            $details = OfftakeDetail::where('kode', $request->kode)->where('status', 1)->get();
            if ($details->isEmpty()) {
                throw new \Exception("Tidak ada produk dalam daftar offtake.");
            }

            foreach ($details as $detail) {
                $produk = Produk::findOrFail($detail->produk_id);

                // 4. Update Status Produk & Detail (Status 3 = Offtake/Sold to Supplier)
                $produk->update(['status' => 3]);
                $detail->update(['status' => 2]); // Lunas

                // 5. Mutasi Nampan (KELUAR dari Toko)
                $nampanAktif = DB::table('nampanproduk')
                    ->where('produk_id', $produk->id)
                    ->where('status', 1)
                    ->first();

                if ($nampanAktif) {
                    DB::table('nampanproduk')->where('id', $nampanAktif->id)->update(['status' => 2]);
                    DB::table('nampanproduk')->insert([
                        'nampan_id' => $nampanAktif->nampan_id,
                        'produk_id' => $produk->id,
                        'jenis'     => 'KELUAR',
                        'tanggal'   => now(),
                        'oleh'      => Auth::id(),
                        'status'    => 2,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // 6. Update Header Offtake
            $offtake->update([
                'suplier_id' => $request->suplier_id,
                'hargatotal' => $request->total,
                'status'     => 2, // Selesai
                'tanggal'    => now(),
            ]);

            // 7. INSERT MUTASI SALDO (MASUK - Karena Supplier membayar kita)
            DB::table('mutasisaldo')->insert([
                'saldo_id'   => $saldoAktif->id,
                'tanggal'    => now()->format('Y-m-d'),
                'keterangan' => "Penerimaan Offtake Supplier (" . $offtake->kode . ")",
                'jenis'      => 'MASUK', // DANA MASUK
                'jumlah'     => $request->total,
                'oleh'       => Auth::id(),
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 8. Tambah Saldo Utama
            DB::table('saldo')->where('id', $saldoAktif->id)->increment('total', $request->total);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Offtake berhasil. Dana masuk ke rekening: ' . $saldoAktif->rekening
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal: ' . $e->getMessage()
            ], 500);
        }
    }
}
