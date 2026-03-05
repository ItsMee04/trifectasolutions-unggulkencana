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
        DB::unprepared("
            DROP PROCEDURE IF EXISTS CetakNotaPenjualan;
        ");

        DB::unprepared("
            CREATE PROCEDURE CetakNotaPenjualan(IN KODETRANSAKSI_INPUT VARCHAR(255))
            BEGIN
                SELECT
                    tr.kode,
                    pl.nama AS namapelanggan,
                    pl.alamat,
                    pl.kontak,
                    pg.nip,
                    pg.nama AS namapegawai,
                    pr.kodeproduk,
                    pr.nama AS namaproduk,
                    kr.berat,
                    kr.karat,
                    ds.diskon,
                    ds.nilai,
                    kr.hargajual,
                    pr.image,
                    tr.total,
                    tr.terbilang,
                    kr.total AS keranjangtotal
                FROM produk pr
                JOIN transaksidetail kr ON pr.id = kr.produk_id
                JOIN transaksi tr ON kr.kode = tr.kode
                JOIN pelanggan pl ON tr.pelanggan_id = pl.id
                LEFT JOIN diskon ds ON tr.diskon_id = ds.id
                JOIN users us ON tr.oleh = us.id
                JOIN pegawai pg ON us.pegawai_id = pg.id
                WHERE tr.kode = KODETRANSAKSI_INPUT COLLATE utf8mb4_unicode_ci;
            END;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakNotaPenjualan');
    }
};
