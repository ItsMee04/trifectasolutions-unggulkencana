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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanPerbaikan;");

        DB::unprepared("
        CREATE PROCEDURE CetakLaporanPerbaikan(
            IN TANGGAL_AWAL DATE,
            IN TANGGAL_AKHIR DATE
        )
        BEGIN
            SELECT

                p.kode,
                pr.kodeproduk,
                pr.nama,
                pr.berat,
                jp.jenis,
                kr.karat,
                k.kondisi,
                pr.keterangan,
                p.tanggalmasuk,
                p.tanggalkeluar,

                SUM(pr.berat) OVER() AS TOTALBERAT,
                COUNT(*) OVER() AS TOTALPOTONG

            FROM perbaikan p
            JOIN produk pr ON p.produk_id = pr.id
            JOIN kondisi k ON p.kondisi_id = k.id
            JOIN jenisproduk jp on pr.jenisproduk_id = jp.id
            JOIN karat kr on pr.karat_id = kr.id
            JOIN users u ON p.oleh = u.id
            JOIN pegawai pg ON u.pegawai_id = pg.id
            WHERE p.status != 0
            AND DATE(p.tanggalmasuk) BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR; -- TITIK KOMA DI SINI WAJIB ADA
        END
    ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanPerbaikan');
    }
};
