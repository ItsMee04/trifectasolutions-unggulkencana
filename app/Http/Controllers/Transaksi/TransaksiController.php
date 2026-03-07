<?php

namespace App\Http\Controllers\Transaksi;

use App\Http\Controllers\Controller;
use App\Models\Master\Produk;
use App\Models\Transaksi\Transaksi;
use App\Models\Transaksi\TransaksiDetail;
use App\Services\TransaksiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class TransaksiController extends Controller
{
    protected $transaksiService;

    // Inject service melalui constructor
    public function __construct(TransaksiService $transaksiService)
    {
        $this->transaksiService = $transaksiService;
    }

    public function getKodeTransaksi()
    {
        try {
            // 1. Cari apakah ada transaksi milik user login yang statusnya masih DRAFT (1)
            $transaksiAktif = Transaksi::where('oleh', Auth::id())
                ->where('status', 1)
                ->latest()
                ->first();

            if ($transaksiAktif) {
                // Jika ada, gunakan kode yang sudah ada di database
                $kode = $transaksiAktif->kode;
                $message = 'Menggunakan kode transaksi aktif';
            } else {
                // Jika tidak ada, barulah panggil service untuk generate nomor urut baru
                $kode = $this->transaksiService->generateKodeTransaksi();
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

    public function storeProdukToTransaksiDetail(Request $request)
    {
        $request->validate([
            'kode' => 'required',
            'kodeproduk' => 'required|exists:produk,kodeproduk',
            'harga' => 'required|numeric',
            'berat' => 'required|numeric',
        ]);

        try {
            $produk = Produk::where('kodeproduk', $request->kodeproduk)->firstOrFail();

            // 1. VALIDASI: Cek apakah kode transaksi ini SUDAH memiliki detail (isi)
            // Jika sudah ada 1 barang, maka barang ke-2 akan ditolak
            $sudahAdaIsi = TransaksiDetail::where('kode', $request->kode)
                ->where('status', 1)
                ->exists();

            if ($sudahAdaIsi) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal! Transaksi ini sudah berisi produk. Satu transaksi hanya boleh untuk satu produk emas.'
                ], 400);
            }

            // 2. VALIDASI: Cek apakah produk ini sedang aktif di transaksi lain (opsional)
            $isExistsGlobal = TransaksiDetail::where('produk_id', $produk->id)
                ->where('status', 1)
                ->exists();

            if ($isExistsGlobal) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal! Produk ini sedang dalam proses transaksi aktif.'
                ], 400);
            }

            DB::beginTransaction();

            // 4. Header Transaksi (FirstOrCreate)
            $transaksi = Transaksi::firstOrCreate(
                ['kode' => $request->kode],
                [
                    'tanggal'   => now(),
                    'oleh'      => Auth::id(),
                    'status'    => 1,
                    'total'     => 0,
                    'terbilang' => 'nol rupiah'
                ]
            );

            // 5. Perhitungan & Simpan Detail
            $totalHargaBarang = $request->harga * $request->berat;
            $terbilangBarang  = $this->transaksiService->terbilang($totalHargaBarang);

            $detail = new TransaksiDetail();
            $detail->kode       = $request->kode;
            $detail->produk_id  = $produk->id;
            $detail->hargajual  = $request->harga;
            $detail->berat      = $request->berat;
            $detail->karat      = $request->karat;
            $detail->lingkar    = $request->lingkar ?? 0;
            $detail->panjang    = $request->panjang ?? 0;
            $detail->total      = $totalHargaBarang;
            $detail->terbilang  = $terbilangBarang . " rupiah";
            $detail->oleh       = Auth::id();
            $detail->status     = 1;
            $detail->save();

            // 6. Sinkronisasi Header
            $transaksi->increment('total', $detail->total);
            $transaksi->refresh();
            $transaksi->update([
                'terbilang' => $this->transaksiService->terbilang($transaksi->total) . " rupiah"
            ]);

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Produk ' . $produk->nama . ' berhasil masuk keranjang',
                'data'    => $detail->load('produk')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getTransaksiDetail()
    {
        $data = TransaksiDetail::with(['produk'])->where('status', 1)->get();

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

    public function batalTransaksiDetail(Request $request)
    {
        try {
            DB::beginTransaction();

            // 1. Cari detail yang masih aktif (status 1)
            $detail = TransaksiDetail::where('id', $request->id)
                ->where('status', 1)
                ->firstOrFail();

            $kodeTransaksi = $detail->kode;
            $totalDibatalkan = $detail->total;

            // 2. Ubah status menjadi 0 (Batal/History) bukannya dihapus
            $detail->update([
                'status' => 0,
                'oleh'   => Auth::id() // Mencatat siapa yang membatalkan
            ]);

            // 3. Update Header Transaksi agar nominalnya berkurang
            $transaksi = Transaksi::where('kode', $kodeTransaksi)->first();

            if ($transaksi) {
                // Hitung total baru hanya dari detail yang masih status 1
                $newTotal = TransaksiDetail::where('kode', $kodeTransaksi)
                    ->where('status', 1)
                    ->sum('total');

                $transaksi->update([
                    'total'     => $newTotal,
                    'terbilang' => $this->transaksiService->terbilang($newTotal) . " rupiah",
                    'status'    => 0,
                ]);
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Produk dibatalkan dari keranjang'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Gagal membatalkan produk: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentTransaksi(Request $request)
    {
        $request->validate([
            'kode'      => 'required',
            'pelanggan' => 'required',
            'total'     => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Saldo/Rekening yang sedang Aktif (Status 1)
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if (!$saldoAktif) {
                throw new \Exception("Tidak ada rekening saldo yang aktif. Harap setel rekening aktif terlebih dahulu.");
            }

            // 2. Cari Header Transaksi
            $transaksi = Transaksi::where('kode', $request->kode)->firstOrFail();

            // 3. Cari Detail Transaksi (Draft)
            $detail = TransaksiDetail::where('kode', $request->kode)
                ->where('status', 1)
                ->firstOrFail();

            // 4. Cari Produk & Data Nampan Terakhir
            $produk = Produk::findOrFail($detail->produk_id);

            $nampanLama = DB::table('nampanproduk')
                ->where('produk_id', $produk->id)
                ->where('jenis', 'MASUK')
                ->where('status', 1)
                ->first();

            if (!$nampanLama) {
                throw new \Exception("Produk tidak ditemukan di nampan aktif.");
            }

            // 5. Update Header Transaksi
            $transaksi->update([
                'pelanggan_id' => $request->pelanggan,
                'diskon_id'    => $request->diskon,
                'total'        => $request->total,
                'status'       => 2, // Lunas
                'tanggal'      => now(),
            ]);

            // 6. Update Detail Transaksi
            $detail->update(['status' => 2]);

            // 7. Update Master Produk (Terjual)
            $produk->update(['status' => 2]);

            // 8. Update Mutasi Nampan (Keluar)
            DB::table('nampanproduk')->where('id', $nampanLama->id)->update(['status' => 2]);
            DB::table('nampanproduk')->insert([
                'nampan_id' => $nampanLama->nampan_id,
                'produk_id' => $produk->id,
                'jenis'     => 'KELUAR',
                'tanggal'   => now()->format('Y-m-d'),
                'oleh'      => Auth::id(),
                'status'    => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 9. INSERT MUTASI SALDO (Pemasukan Kas)
            DB::table('mutasisaldo')->insert([
                'saldo_id'   => $saldoAktif->id, // ID dari rekening aktif yang dicari di atas
                'tanggal'    => now()->format('Y-m-d'),
                'keterangan' => "Penjualan produk: " . $produk->nama . " (" . $transaksi->kode . ")",
                'jenis'      => 'MASUK',
                'jumlah'     => $request->total,
                'oleh'       => Auth::id(),
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 10. UPDATE TOTAL SALDO (Opsional: Jika Anda ingin saldo di tabel 'saldo' ikut bertambah secara real-time)
            DB::table('saldo')->where('id', $saldoAktif->id)->increment('total', $request->total);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Pembayaran berhasil. Dana masuk ke rekening: ' . $saldoAktif->rekening
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSignedNotaPenjualanUrl(Request $request)
    {
        $route_name = 'produk.cetak_notapenjualan';
        $expiration = now()->addMinutes(10);

        $signedUrl = URL::temporarySignedRoute(
            $route_name,
            $expiration,
            [
                'kode' => $request->kode,
            ]
        );

        return response()->json(['url' => $signedUrl]);
    }

    public function CetakNotaPenjualan(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(401, 'Link kadaluarsa atau tidak valid.');
        }

       $kode  = $request->query('kode');

        // Configuration
        $jasper_file = resource_path('reports/CetakNotaPenjualan.jasper');
        $db = config('database.connections.mysql');

        // Parameters (Disederhanakan)
        $parameters = [
            'LOGO'                  => public_path('assets/report/LOGOTOKO.png'),
            'LOGOTEXT'              => public_path('assets/report/LOGOTEXT.png'),
            'PRODUK'                => public_path('storage/images/produk/'),
            'TTD'                   => public_path('assets/ttd/'),
            'TERIMAKASIH'           => public_path('assets/report/thanksforshopping.png'),
            'KODETRANSAKSI_INPUT'   => $kode, // Jasper biasanya butuh ID untuk query internal
        ];

        try {
            $tempDir = storage_path('app/temp_reports');
            if (!file_exists($tempDir)) mkdir($tempDir, 0755, true);

            $outputName = 'nota-' . $kode . '-' . time();
            $outputPath = $tempDir . '/' . $outputName;

            $jasper = new \PHPJasper\PHPJasper;
            $jasper->process(
                $jasper_file,
                $outputPath,
                [
                    'format' => ['pdf'],
                    'params' => $parameters,
                    'db_connection' => [
                        'driver' => 'mysql',
                        'host' => $db['host'],
                        'port' => $db['port'],
                        'database' => $db['database'],
                        'username' => $db['username'],
                        'password' => $db['password'],
                    ],
                ]
            )->execute();

            $pdfPath = $outputPath . '.pdf';

            if (!file_exists($pdfPath)) {
                throw new \Exception("File PDF tidak terbentuk oleh Jasper.");
            }

            $pdfContent = file_get_contents($pdfPath);
            unlink($pdfPath); // Hapus file temp setelah dibaca

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="NOTA-' . $kode . '.pdf"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTransaksiPenjualan()
    {
        $data = Transaksi::with(['transaksidetail', 'transaksidetail.produk', 'pelanggan', 'diskon', 'oleh'])->where('status', '!=', 0)->get();

        if ($data->isEmpty()) {
            return response()->json([
                'status'    => false,
                'message'   => 'Data transaksi tidak ditemukan',
                'data'      => []
            ], 400);
        }

        return response()->json([
            'status'    => true,
            'messaage'  => 'Data transaksi berhasil ditemukan',
            'data'      => $data,
        ], 200);
    }

    public function batalTransaksi(Request $request)
    {
        $request->validate([
            'kode'   => 'required|exists:transaksi,kode',
        ]);

        try {
            DB::beginTransaction();

            // 1. Ambil data transaksi beserta detailnya
            $transaksi = Transaksi::where('kode', $request->kode)->firstOrFail();

            // Proteksi agar tidak membatalkan transaksi yang sudah batal
            if ($transaksi->status == 0) {
                throw new \Exception("Transaksi ini sudah dibatalkan sebelumnya.");
            }

            $detail = TransaksiDetail::where('kode', $request->kode)->first();
            if (!$detail) {
                throw new \Exception("Detail transaksi tidak ditemukan.");
            }

            // 2. ROLLBACK PRODUK
            // Kembalikan status produk menjadi 1 (Tersedia)
            // User nanti harus memasukkan produk ini ke nampan secara manual melalui menu nampan.
            $produk = Produk::findOrFail($detail->produk_id);
            $produk->update(['status' => 1]);

            // 3. ROLLBACK MUTASI SALDO
            // Cari mutasi MASUK yang memiliki referensi kode transaksi ini
            $mutasi = DB::table('mutasisaldo')
                ->where('keterangan', 'like', '%' . $transaksi->kode . '%')
                ->where('jenis', 'MASUK')
                ->first();

            if ($mutasi) {
                // Kurangi saldo di tabel utama agar sinkron
                DB::table('saldo')
                    ->where('id', $mutasi->saldo_id)
                    ->decrement('total', $mutasi->jumlah);

                // Hapus record mutasi saldo tersebut
                DB::table('mutasisaldo')->where('id', $mutasi->id)->delete();
            }

            // 5. UPDATE STATUS TRANSAKSI & DETAIL
            // Kita gunakan status 0 sebagai tanda transaksi ini CANCEL/VOID
            $transaksi->update([
                'status'           => 0,
            ]);

            $detail->update(['status' => 0]);

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => "Transaksi {$request->kode} berhasil dibatalkan."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal membatalkan transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}
