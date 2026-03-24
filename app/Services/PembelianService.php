<?php

namespace App\Services;

use App\Models\Transaksi\Pembelian;
use Carbon\Carbon;

class PembelianService
{
    public function generateKodeTransaksi()
    {
        // 1. Ambil tanggal hari ini (contoh: 20260301)
        $today = Carbon::now()->format('Ymd');
        $prefixToday = 'PM-' . $today . '-';

        // 2. Ambil kode terakhir secara alfabetis (Global)
        // Kita mencari kode yang berawalan 'TR-'
        $lastRecord = Pembelian::where('kode', 'like', 'PM-%')
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

    public function terbilang($angka)
    {
        $angka = abs((int)$angka);
        $huruf = ["", "SATU", "DUA", "TIGA", "EMPAT", "LIMA", "ENAM", "TUJUH", "DELAPAN", "SEMBILAN", "SEPULUH", "SEBELAS"];
        $hasil = "";

        if ($angka < 12) {
            $hasil = $huruf[$angka];
        } elseif ($angka < 20) {
            $hasil = $this->terbilang($angka - 10) . " BELAS";
        } elseif ($angka < 100) {
            $hasil = $this->terbilang(floor($angka / 10)) . " PULUH " . $this->terbilang($angka % 10);
        } elseif ($angka < 200) {
            $hasil = "seratus " . $this->terbilang($angka - 100);
        } elseif ($angka < 1000) {
            $hasil = $this->terbilang(floor($angka / 100)) . " RATUS " . $this->terbilang($angka % 100);
        } elseif ($angka < 2000) {
            $hasil = "seribu " . $this->terbilang($angka - 1000);
        } elseif ($angka < 1000000) {
            $hasil = $this->terbilang(floor($angka / 1000)) . " RIBU " . $this->terbilang($angka % 1000);
        } elseif ($angka < 1000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000)) . " JUTA " . $this->terbilang($angka % 1000000);
        } elseif ($angka < 1000000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000000)) . " MILIAR " . $this->terbilang($angka % 1000000000);
        } elseif ($angka < 1000000000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000000000)) . " TRILIUN " . $this->terbilang($angka % 1000000000000);
        } else {
            return "ANGKA TERLALU BESAR";
        }

        return trim($hasil);
    }
}
