<?php

use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Bersihkan procedure lama jika ada
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanProduk;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanProduk()
            BEGIN
                SELECT
                    p.kodeproduk,
                    p.nama,
                    p.berat,
                    jp.jenis AS jenisproduk,
                    k.karat,
                    jk.jenis AS jeniskarat,
                    p.lingkar,
                    p.panjang,
                    h.harga AS hargapergram,
                    p.keterangan,
                    kd.kondisi,

                    -- 1. Status per baris (1 = sudah masuk nampan aktif, 0 = belum/keluar)
                    (SELECT COUNT(*)
                     FROM nampanproduk np
                     WHERE np.produk_id = p.id
                       AND np.jenis = 'MASUK'
                       AND np.status = 1) AS status_nampan,

                    -- 2. Akumulasi Total: Sudah Masuk Nampan
                    SUM(CASE WHEN (
                        SELECT COUNT(*)
                        FROM nampanproduk np
                        WHERE np.produk_id = p.id
                          AND np.jenis = 'MASUK'
                          AND np.status = 1
                    ) > 0 THEN 1 ELSE 0 END) OVER() AS total_sudah_masuk,

                    -- 3. Akumulasi Total: Belum Masuk Nampan
                    SUM(CASE WHEN (
                        SELECT COUNT(*)
                        FROM nampanproduk np
                        WHERE np.produk_id = p.id
                          AND np.jenis = 'MASUK'
                          AND np.status = 1
                    ) = 0 THEN 1 ELSE 0 END) OVER() AS total_belum_masuk,

                    -- 4. Ringkasan Keseluruhan Baris
                    COUNT(p.id) OVER() AS total_potong_all,
                    SUM(p.berat) OVER() AS total_berat_all

                FROM produk p
                JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                JOIN karat k ON p.karat_id = k.id
                JOIN jeniskarat jk ON p.jeniskarat_id = jk.id
                JOIN harga h ON p.harga_id = h.id
                JOIN kondisi kd ON p.kondisi_id = kd.id
                WHERE p.status = 1
                ORDER BY jp.urutan ASC, p.kodeproduk ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanProduk');
    }
};
