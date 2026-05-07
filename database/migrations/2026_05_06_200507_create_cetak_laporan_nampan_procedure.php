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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanNampan;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanNampan(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                SELECT
                    n.tanggal,
                    n.nampan AS nama_baki,
                    jp.jenis AS kategori,
                    p.kodeproduk,
                    p.nama AS nama_produk,
                    p.berat,
                    k.karat AS kadar,
                    np.jenis AS pergerakan,
                    np.status AS status_data,

                    -- Kolom Baru: Total Unit Aktif dalam Nampan ini
                    (SELECT COUNT(np2.produk_id)
                     FROM nampanproduk np2
                     WHERE np2.nampan_id = n.id
                       AND np2.jenis = 'MASUK'
                       AND np2.status = 1) AS total_unit_nampan,

                    -- Kolom Baru: Total Berat Aktif dalam Nampan ini
                    (SELECT SUM(p2.berat)
                     FROM nampanproduk np3
                     JOIN produk p2 ON np3.produk_id = p2.id
                     WHERE np3.nampan_id = n.id
                       AND np3.jenis = 'MASUK'
                       AND np3.status = 1) AS total_berat_nampan

                FROM nampan n
                JOIN nampanproduk np ON n.id = np.nampan_id
                JOIN produk p ON np.produk_id = p.id
                JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                JOIN karat k ON p.karat_id = k.id
                WHERE n.tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                ORDER BY
                    n.tanggal ASC,
                    n.nampan ASC,
                    jp.urutan ASC,
                    p.kodeproduk ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanNampan');
    }
};
