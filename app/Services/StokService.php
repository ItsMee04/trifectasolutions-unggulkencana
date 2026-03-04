<?php

namespace App\Services;

use App\Models\Inventori\StokHarian;
use Carbon\Carbon;

class StokService
{
    public function generateKodeStok()
    {
        // 1. Ambil tanggal hari ini (contoh: 20260301)
        $today = Carbon::now()->format('Ymd');
        $prefixToday = 'ST-' . $today . '-';

        // 2. Ambil kode terakhir secara alfabetis (Global)
        // Kita mencari kode yang berawalan 'TR-'
        $lastRecord = StokHarian::where('kode', 'like', 'ST-%')
            ->orderBy('kode', 'desc')
            ->first();

        if (!$lastRecord) {
            // Jika benar-benar data pertama
            $nextNumber = 1;
        } else {
            // Pecah kode terakhir (contoh: TR-20260301-0000005)
            $segments = explode('-', $lastRecord->kode);

            // Ambil bagian terakhir (0000005), lalu convert ke integer agar bisa dijumlah
            $lastNumber = (int) end($segments);
            $nextNumber = $lastNumber + 1;
        }

        // 3. Gabungkan prefix hari ini dengan urutan baru (tetap 7 digit)
        // Hasilnya: TR-20260301-0000006
        return $prefixToday . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }
}
