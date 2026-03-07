<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
use PHPJasper\PHPJasper;

class CompailReportController extends Controller
{
    public function CompileReports()
    {
        // Target file JRXML
        $input_jrxml = resource_path('reports/CetakNotaOfftake.jrxml');
        $output_dir = resource_path('reports'); // Output .jasper di folder reports/

        if (!file_exists($input_jrxml)) {
            return response()->json(['error' => 'File JRXML tidak ditemukan. Silakan cek path: ' . $input_jrxml], 404);
        }

        $jasper = new PHPJasper();

        try {
            // Mengompilasi jrxml ke jasper
            $jasper->compile(
                $input_jrxml,
                false // Tidak ada opsi tambahan
            )->execute();

            return response()->json([
                'message' => 'Kompilasi CetakNotaOfftake.jrxml berhasil!',
                'output_file' => $output_dir . '/CetakNotaOfftake.jasper'
            ]);
        } catch (\Exception $e) {
            // Jika ini gagal, cek kembali JRXML Anda di Jaspersoft Studio!
            return response()->json(['error' => 'Gagal Kompilasi (Error Java/XML): ' . $e->getMessage()], 500);
        }
    }
}
