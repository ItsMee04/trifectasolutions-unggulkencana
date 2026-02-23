<?php

namespace App\Services;

use App\Models\Master\Pelanggan;

class PelangganService
{
    public function generateKodePelanggan()
    {
        // Ambil data terakhir berdasarkan ID
        $lastRecord = Pelanggan::orderBy('id', 'desc')->first();

        if (!$lastRecord) {
            $nextNumber = 1;
        } else {
            // Mengambil angka dari kode terakhir (menghapus 'PL-')
            $lastNumber = (int) str_replace('PL-', '', $lastRecord->kode);
            $nextNumber = $lastNumber + 1;
        }

        // Format: PL- + angka 6 digit (contoh: PL-000001)
        return 'PL-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
