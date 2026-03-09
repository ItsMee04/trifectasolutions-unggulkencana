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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanOfftake;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanOfftake(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                SELECT
                    *, -- Tambahkan ini agar semua kolom dari subquery muncul
                    SUM(CASE WHEN baris_ke = 1 THEN totaltransaksi ELSE 0 END) OVER() AS grandtotaltransaksi
                FROM (
                    SELECT
                        o.kode,
                        o.tanggal,
                        p.kodeproduk,
                        p.nama,
                        p.berat,
                        jp.jenis,
                        k.karat,
                        od.hargajual,
                        od.total AS totalproduk,
                        o.hargatotal AS totaltransaksi,
                        pg.nama AS pegawai,

                        SUM(od.total) OVER(PARTITION BY o.kode) AS hargatotalproduk,
                        SUM(p.berat) OVER(PARTITION BY o.kode) AS totalberat,
                        COUNT(*) OVER(PARTITION BY o.kode) AS totalpotong,

                        SUM(p.berat) OVER() AS grandtotalberat,
                        COUNT(*) OVER() AS grandtotalpotong,

                        ROW_NUMBER() OVER(PARTITION BY o.kode ORDER BY p.id) as baris_ke

                    FROM offtakedetail od
                    JOIN offtake o ON od.kode = o.kode
                    JOIN produk p ON od.produk_id = p.id
                    JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                    JOIN karat k ON p.karat_id = k.id
                    JOIN users u ON od.oleh = u.id
                    JOIN pegawai pg ON u.pegawai_id = pg.id

                    WHERE o.status = 2
                    AND DATE(o.tanggal) BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                ) AS subquery
                ORDER BY kode ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanOfftake');
    }
};
