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
            DROP PROCEDURE IF EXISTS CetakNotaOfftake;
        ");

        DB::unprepared("
            CREATE PROCEDURE CetakNotaOfftake(IN KODETRANSAKSI_INPUT VARCHAR(255))
            BEGIN
                SELECT
                    o.kode,
                    o.tanggal,
                    s.nama AS supplier_nama,
                    s.kontak,
                    s.alamat,

                    pr.kodeproduk,
                    pr.nama AS produk_nama,
                    pr.image,
                    ko.berat,
                    ko.karat,
                    ko.hargajual,
                    ko.total,

                    -- Mengambil total kotor dari seluruh item (Subtotal)
                    (SELECT SUM(ko2.total)
                    FROM offtakedetail ko2
                    WHERE ko2.kode = o.kode AND ko2.status != 0) AS subtotal,

                    -- Menghitung selisih antara total item vs harga final (Potongan)
                    GREATEST(
                        (SELECT SUM(ko2.total)
                        FROM offtakedetail ko2
                        WHERE ko2.kode = o.kode AND ko2.status != 0) - o.hargatotal,
                        0
                    ) AS potongan,

                    o.terbilang,
                    o.hargatotal, -- Ini adalah total bersih yang dibayar
                    pg.nip,
                    pg.nama AS pegawai_nama

                FROM offtake o
                JOIN offtakedetail ko ON o.kode = ko.kode
                JOIN produk pr ON ko.produk_id = pr.id
                JOIN suplier s ON o.suplier_id = s.id
                JOIN users u ON o.oleh = u.id
                JOIN pegawai pg ON u.pegawai_id = pg.id
                WHERE o.kode = KODETRANSAKSI_INPUT COLLATE utf8mb4_unicode_ci;
            END;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakNotaOfftake');
    }
};
