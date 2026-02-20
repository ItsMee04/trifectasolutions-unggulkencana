<?php

namespace App\Services;

use App\Models\Master\Produk;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Generate kode unik alfanumerik
     */
    public function generateUniqueCode(): string
    {
        $length = 10;

        // Menggunakan Str::random agar lebih aman (Cryptographically Secure)
        // Jika ingin tetap pakai logika manual for-loop Anda juga bisa di sini
        $code = Str::random($length);

        // Validasi agar tidak duplikat di database
        $exists = Produk::where('kodeproduk', $code)->exists();

        if ($exists) {
            return $this->generateUniqueCode(); // Rekursif jika kode sudah ada
        }

        return $code;
    }
}
