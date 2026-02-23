<?php

namespace Database\Seeders;

use App\Models\Master\Produk;
use App\Services\ProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Milon\Barcode\DNS1D;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productService = new ProductService();
        $barcodeGenerator = new DNS1D();

        // Data dummy untuk rotasi
        $jenis = [1, 2, 3, 4, 5];
        $karatMap = [
            1 => [1, 2], // Karat ID 1 -> JenisKarat 1,2 -> Harga ID 1,2
            2 => [3, 4], // Karat ID 2 -> JenisKarat 3,4 -> Harga ID 3,4
            3 => [5, 6], // Karat ID 3 -> JenisKarat 5,6 -> Harga ID 5,6
        ];

        for ($i = 1; $i <= 100; $i++) {
            $kodeproduk = $productService->generateUniqueCode();

            // Logika Barcode sama dengan Controller
            $barcodeBase64 = $barcodeGenerator->getBarcodeJPG($kodeproduk, 'C128', 1.2, 20);
            Storage::disk('public')->put('images/barcode/' . $kodeproduk . '.jpg', base64_decode($barcodeBase64));

            $karatId = array_rand($karatMap);
            $indexKarat = array_rand($karatMap[$karatId]);
            $jenisKaratId = $karatMap[$karatId][$indexKarat];
            $hargaId = $jenisKaratId; // Kebetulan di JSON Anda ID Harga = ID Jenis Karat

            Produk::create([
                'kodeproduk'    => $kodeproduk,
                'nama'          => 'PRODUK DUMMY ' . $i,
                'berat'         => number_format(rand(1000, 5000) / 1000, 3, '.', ''),
                'jenisproduk_id' => $jenis[array_rand($jenis)],
                'karat_id'      => $karatId,
                'jeniskarat_id' => $jenisKaratId,
                'lingkar'       => rand(0, 15),
                'panjang'       => rand(0, 50),
                'harga_id'      => $hargaId,
                'keterangan'    => 'AUTO GENERATED SEEDER',
                'image'         => '',
                'status'        => 1,
                'kondisi_id'    => 1,
            ]);
        }
    }
}
