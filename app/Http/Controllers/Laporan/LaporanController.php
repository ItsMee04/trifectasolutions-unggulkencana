<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\Transaksi\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class LaporanController extends Controller
{
    public function getSignedCetakLaporanPenjualanUrl(Request $request)
    {
        $route_name = 'produk.cetak_laporanpenjualan';
        $expiration = now()->addMinutes(5);

        $signedUrl = URL::temporarySignedRoute(
            $route_name,
            $expiration,
            [
                'TANGGAL_AWAL' => $request->periodedari,
                'TANGGAL_AKHIR' => $request->periodesampai
            ]
        );

        return response()->json(['url' => $signedUrl]);
    }

    public function CetakLaporanPenjualan(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        if (!$request->hasValidSignature()) {
            abort(401, 'Invalid signature.');
        }

        $TANGGAL_AWAL  = $request->query('TANGGAL_AWAL');
        $TANGGAL_AKHIR = $request->query('TANGGAL_AKHIR');

        if (!$TANGGAL_AWAL) {
            abort(400, 'Tanggal awal tidak ditemukan');
        }

        if (!$TANGGAL_AKHIR) {
            abort(400, 'Tanggal akhir tidak ditemukan');
        }

        $jasper_file = resource_path('reports/CetakLaporanPenjualan.jasper');

        $db = config('database.connections.mysql');

        $parameters = [
            'TANGGAL_AWAL' => $TANGGAL_AWAL,
            'TANGGAL_AKHIR' => $TANGGAL_AKHIR
        ];

        try {
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) mkdir($tempDir, 0777, true);

            $outputFile = $tempDir . '/LaporanPenjualan-' . $TANGGAL_AWAL . ' _sd_ ' . $TANGGAL_AKHIR;

            $jasper = new \PHPJasper\PHPJasper;
            $jasper->process(
                $jasper_file,
                $outputFile,
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

            $pdfPath = $outputFile . '.pdf';
            $pdfContent = file_get_contents($pdfPath);
            unlink($pdfPath);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="LAPORAN-PENJUALAN-' . $TANGGAL_AWAL . ' _sd_ ' . $TANGGAL_AKHIR . '.pdf"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal membuat laporan: ' . $e->getMessage()], 500);
        }
    }

    public function getSignedCetakLaporanPembelianUrl(Request $request)
    {
        $route_name = 'produk.cetak_laporanpembelian';
        $expiration = now()->addMinutes(5);

        $signedUrl = URL::temporarySignedRoute(
            $route_name,
            $expiration,
            [
                'TANGGAL_AWAL' => $request->periodedari,
                'TANGGAL_AKHIR' => $request->periodesampai
            ]
        );

        return response()->json(['url' => $signedUrl]);
    }

    public function CetakLaporanPembelian(Request $request)
    {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        if (!$request->hasValidSignature()) {
            abort(401, 'Invalid signature.');
        }

        $TANGGAL_AWAL  = $request->query('TANGGAL_AWAL');
        $TANGGAL_AKHIR = $request->query('TANGGAL_AKHIR');

        if (!$TANGGAL_AWAL) {
            abort(400, 'Tanggal awal tidak ditemukan');
        }

        if (!$TANGGAL_AKHIR) {
            abort(400, 'Tanggal akhir tidak ditemukan');
        }

        $jasper_file = resource_path('reports/CetakLaporanPembelian.jasper');

        $db = config('database.connections.mysql');

        $parameters = [
            'TANGGAL_AWAL' => $TANGGAL_AWAL,
            'TANGGAL_AKHIR' => $TANGGAL_AKHIR
        ];

        try {
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) mkdir($tempDir, 0777, true);

            $outputFile = $tempDir . '/LaporanPembelian-' . $TANGGAL_AWAL . ' _sd_ ' . $TANGGAL_AKHIR;

            $jasper = new \PHPJasper\PHPJasper;
            $jasper->process(
                $jasper_file,
                $outputFile,
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

            $pdfPath = $outputFile . '.pdf';
            $pdfContent = file_get_contents($pdfPath);
            unlink($pdfPath);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="LAPORAN-PEMBELIAN-' . $TANGGAL_AWAL . ' _sd_ ' . $TANGGAL_AKHIR . '.pdf"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal membuat laporan: ' . $e->getMessage()], 500);
        }
    }
}
