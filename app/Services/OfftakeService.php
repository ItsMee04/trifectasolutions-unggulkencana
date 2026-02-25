<?php

namespace App\Services;

use App\Models\Transaksi\Offtake;
use Carbon\Carbon;

class OfftakeService
{
    public function generateKodeTransaksi()
    {
        // 1. Ambil tanggal hari ini dalam format Ymd (contoh: 20251025)
        $today = Carbon::now()->format('Ymd');
        $prefix = 'OF-' . $today . '-';

        // 2. Cari transaksi terakhir yang kodenya mirip dengan prefix hari ini
        // Ini penting agar nomor urut di-reset setiap hari
        $lastRecord = Offtake::where('kode', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastRecord) {
            // Jika belum ada transaksi hari ini, mulai dari 1
            $nextNumber = 1;
        } else {
            // Mengambil angka urut dari bagian terakhir setelah dash (-) ketiga
            // Contoh: TR-20251025-0000001 -> diambil 0000001 nya
            $segments = explode('-', $lastRecord->kode);
            $lastNumber = (int) end($segments);
            $nextNumber = $lastNumber + 1;
        }

        // 3. Format: TR-TANGGAL-angka 7 digit (contoh: TR-20251025-0000001)
        return $prefix . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }

    public function terbilang($angka)
    {
        $angka = abs((int)$angka);
        $huruf = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
        $hasil = "";

        if ($angka < 12) {
            $hasil = $huruf[$angka];
        } elseif ($angka < 20) {
            $hasil = $this->terbilang($angka - 10) . " belas";
        } elseif ($angka < 100) {
            $hasil = $this->terbilang(floor($angka / 10)) . " puluh " . $this->terbilang($angka % 10);
        } elseif ($angka < 200) {
            $hasil = "seratus " . $this->terbilang($angka - 100);
        } elseif ($angka < 1000) {
            $hasil = $this->terbilang(floor($angka / 100)) . " ratus " . $this->terbilang($angka % 100);
        } elseif ($angka < 2000) {
            $hasil = "seribu " . $this->terbilang($angka - 1000);
        } elseif ($angka < 1000000) {
            $hasil = $this->terbilang(floor($angka / 1000)) . " ribu " . $this->terbilang($angka % 1000);
        } elseif ($angka < 1000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000)) . " juta " . $this->terbilang($angka % 1000000);
        } elseif ($angka < 1000000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000000)) . " miliar " . $this->terbilang($angka % 1000000000);
        } elseif ($angka < 1000000000000000) {
            $hasil = $this->terbilang(floor($angka / 1000000000000)) . " triliun " . $this->terbilang($angka % 1000000000000);
        } else {
            return "angka terlalu besar";
        }

        return trim($hasil);
    }
}
