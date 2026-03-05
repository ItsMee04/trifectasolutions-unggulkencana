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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanPenjualan;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanPenjualan(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                SELECT
                    tr.tanggal,
                    tr.kode,
                    jp.jenis,
                    pr.kodeproduk,
                    pr.berat,
                    k.karat,
                    kr.hargajual AS harga,

                    SUM(pr.berat) OVER() AS TOTALBERAT,
                    SUM(kr.hargajual) OVER() AS TOTALHARGA,
                    COUNT(*) OVER() AS TOTALPOTONG

                FROM transaksidetail kr
                JOIN transaksi tr ON kr.kode = tr.kode
                JOIN produk pr ON kr.produk_id = pr.id
                JOIN jenisproduk jp ON pr.jenisproduk_id = jp.id
                JOIN karat k ON pr.karat_id = k.id

                WHERE tr.status = 2
                AND DATE(tr.tanggal) BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanPenjualan');
    }
};
