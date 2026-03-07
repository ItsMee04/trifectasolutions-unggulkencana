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
use Illuminate\Support\Facades\URL;

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

            $terbilangFix = $this->offtakeService->terbilang($request->total) . " rupiah";

            // 6. Update Header Offtake
            $offtake->update([
                'suplier_id' => $request->suplier_id,
                'hargatotal' => $request->total,
                'status'     => 2, // Selesai
                'terbilang'  => $terbilangFix,
                'keterangan' => $request->keterangan,
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

    public function getTransaksiOfftake()
    {
        $data = Offtake::with(['offtakedetail', 'offtakedetail.produk', 'offtakedetail.produk.karat', 'suplier', 'oleh'])->where('status', '!=', 0)->get();

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
            'kode' => 'required', // Kode OF-xxxx
        ]);

        try {
            DB::beginTransaction();

            // 1. Cari Header Offtake
            $offtake = Offtake::where('kode', $request->kode)->firstOrFail();

            // Validasi: Hanya transaksi status Selesai/Lunas (2) yang bisa dibatalkan
            if ($offtake->status != 2) {
                throw new \Exception("Transaksi tidak dapat dibatalkan karena status bukan 'Lunas'.");
            }

            // 2. Ambil Saldo Aktif untuk penyesuaian (Karena dana batal diterima)
            $saldoAktif = DB::table('saldo')->where('status', 1)->first();
            if (!$saldoAktif) {
                throw new \Exception("Rekening saldo aktif tidak ditemukan untuk penyesuaian dana.");
            }

            // 3. Proses Detail Produk
            $details = OfftakeDetail::where('kode', $request->kode)->get();

            foreach ($details as $detail) {
                $produk = Produk::find($detail->produk_id);

                if ($produk) {
                    // Kembalikan status produk ke 1 (Tersedia kembali di Toko)
                    // Sebelumnya saat payment statusnya 3 (Offtake)
                    $produk->update(['status' => 1]);
                }

                // Update status detail menjadi Batal (3)
                $detail->update(['status' => 0]);
            }

            // 4. HAPUS MUTASI SALDO (Uang Masuk yang dibatalkan)
            // Kita hapus record 'MASUK' yang mereferensi kode offtake ini
            DB::table('mutasisaldo')
                ->where('keterangan', 'like', '%' . $offtake->kode . '%')
                ->where('jenis', 'MASUK')
                ->delete();

            // 5. KURANGI SALDO UTAMA (Decrement)
            // Karena uang yang masuk saat payment harus ditiadakan dari total saldo
            DB::table('saldo')
                ->where('id', $saldoAktif->id)
                ->decrement('total', $offtake->hargatotal);

            // 6. Update Header Offtake
            $offtake->update([
                'status' => 0, // 3 = Batal
                'keterangan' => "PEMBATALAN OFFTAKE: " . ($request->keterangan ?? $offtake->keterangan),
            ]);

            DB::commit();
            return response()->json([
                'status'  => true,
                'message' => 'Pembatalan Offtake Berhasil. Dana telah ditarik dari saldo dan produk kembali tersedia di stok.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Gagal membatalkan offtake: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSignedNotaOfftakeUrl(Request $request)
    {
        $route_name = 'produk.cetak_notaofftake';
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

    public function CetakNotaOfftake(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(401, 'Link kadaluarsa atau tidak valid.');
        }

        $kode  = $request->query('kode');

        // Configuration
        $jasper_file = resource_path('reports/CetakNotaOfftake.jasper');
        $db = config('database.connections.mysql');

        // Parameters (Disederhanakan)
        $parameters = [
            'LOGO'                  => public_path('assets/report/LOGOTOKO.png'),
            'LOGOTEXT'              => public_path('assets/report/LOGOTEXT.png'),
            'PRODUK'                => public_path('storage/images/produk/'),
            'TERIMAKASIH'           => public_path('assets/report/thanksforshopping.png'),
            'TTD'                   => public_path('assets/ttd/'),
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
}
