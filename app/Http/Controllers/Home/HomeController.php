<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Models\Keuangan\MutasiSaldo;
use App\Models\Master\Harga;
use App\Models\Master\Pelanggan;
use App\Models\Master\Suplier;
use App\Models\Transaksi\Offtake;
use App\Models\Transaksi\Pembelian;
use App\Models\Transaksi\Perbaikan;
use App\Models\Transaksi\Transaksi;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
// use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function getTotalSaldoMasuk()
    {
        $data = MutasiSaldo::where('jenis', 'MASUK')
            ->where('status', 1)
            ->sum('jumlah');

        return response()->json([
            'status'    => true,
            'message'   => 'Saldo berhasil ditemukan',
            'data'      => $data
        ]);
    }

    public function getTotalSaldoKeluar()
    {
        $data = MutasiSaldo::where('jenis', 'KELUAR')
            ->where('status', 1)
            ->sum('jumlah');

        return response()->json([
            'status'    => true,
            'message'   => 'Saldo berhasil ditemukan',
            'data'      => $data
        ]);
    }

    public function getTotalPenjualanMasuk()
    {
        $totalTransaksi = Transaksi::where('status', 2)
            ->sum('total');

        $totalOfftake = Offtake::where('status', 2)
            ->sum('total');

        $totalPenjualanMasuk = $totalTransaksi + $totalOfftake;

        return response()->json([
            'success'   => true,
            'message'   => 'Data total penjualan berhasil ditemukan',
            'data'      => $totalPenjualanMasuk
        ]);
    }

    public function getTotalPenjualanKeluar()
    {
        $pembelian = Pembelian::where('status', 2)
            ->sum('total');

        return response()->json([
            'success'   => true,
            'message'   => 'Data total pembelian berhasil ditemukan',
            'data'      => $pembelian
        ]);
    }

    public function getTotalPelanggan()
    {
        $pelanggan = Pelanggan::where('status', 1)
            ->count();

        return response()->json([
            'success'   => true,
            'message'   => 'Data total pelanggan berhasil ditemukan',
            'data'      => $pelanggan
        ]);
    }

    public function getTotalSuplier()
    {
        $suplier = Suplier::where('status', 1)
            ->count();

        return response()->json([
            'success'   => true,
            'message'   => 'Data total suplier berhasil ditemukan',
            'data'      => $suplier
        ]);
    }

    public function getTotalPenjualan()
    {
        $penjualan = Transaksi::where('status', 2)
            ->count();

        return response()->json([
            'success'   => true,
            'message'   => 'Data total penjualan berhasil ditemukan',
            'data'      => $penjualan
        ]);
    }

    public function getTotalPembelian()
    {
        $pembelian = Pembelian::where('status', 2)
            ->count();

        return response()->json([
            'success'   => true,
            'message'   => 'Data total pembelian berhasil ditemukan',
            'data'      => $pembelian
        ]);
    }

    public function getSalesChart()
    {
        try {
            // 1. Tentukan rentang waktu (14 hari terakhir)
            $endDate = Carbon::now();
            $startDate = Carbon::now()->subDays(13);

            // 2. Ambil data dari database
            $salesData = Transaksi::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total')
            )
                ->where('created_at', '>=', $startDate->startOfDay())
                ->groupBy('date')
                ->get()
                ->pluck('total', 'date');

            // 3. Buat periode 14 hari
            $period = CarbonPeriod::create($startDate, $endDate);

            $labels = [];
            $data = [];

            foreach ($period as $date) {
                $formattedDate = $date->format('Y-m-d');
                $labels[] = $date->format('d M');

                // --- PERBAIKAN DI SINI ---
                // 1. Ambil nilai dari collection
                $val = $salesData->get($formattedDate, 0);

                // 2. Jika null, ubah ke 0. Jika ada nilai, cast ke (int) atau (float)
                // Ini akan mengubah "1700000" (string) menjadi 1700000 (number)
                $data[] = $val ? (float)$val : 0;
                // -------------------------
            }

            return response()->json([
                'success' => true,
                'message' => 'Data grafik 14 hari berhasil diambil',
                'data' => [
                    'labels' => $labels,
                    'sales' => $data
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getSalesChartPembelian()
    {
        try {
            $endDate = Carbon::now();
            $startDate = Carbon::now()->subDays(13);

            // 1. Ambil data dan pastikan key-nya adalah string tanggal 'YYYY-MM-DD'
            $purchaseData = Pembelian::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total')
            )
                ->where('created_at', '>=', $startDate->startOfDay())
                ->groupBy('date')
                ->get()
                ->pluck('total', 'date')
                ->toArray(); // Ubah ke array agar pencarian key lebih stabil

            $period = CarbonPeriod::create($startDate, $endDate);

            $labels = [];
            $data = [];

            foreach ($period as $date) {
                // Ini harus SAMA dengan format 'date' yang dihasilkan oleh SQL DATE(created_at)
                $formattedDate = $date->format('Y-m-d');

                $labels[] = $date->format('d M');

                // 2. Cek apakah key $formattedDate ada di dalam array hasil query
                if (isset($purchaseData[$formattedDate])) {
                    $data[] = (float)$purchaseData[$formattedDate];
                } else {
                    $data[] = 0;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Data grafik pembelian berhasil diambil',
                'data' => [
                    'labels' => $labels,
                    'sales' => $data
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getHargaEmas()
    {
        $data = Harga::with(['karat', 'jeniskarat'])->where('status', 1)->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Data produk terlaris ditemukan',
            'data'      => $data
        ]);
    }

    public function getProdukPerbaikan()
    {
        $data = Perbaikan::with(['produk','kondisi'])->where('status', 1)->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Data produk perbaikan ditemukan',
            'data'      => $data
        ]);
    }
}
