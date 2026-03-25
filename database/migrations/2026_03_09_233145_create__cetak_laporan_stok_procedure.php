<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanStok;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanStok(
                IN PERIODE DATE
            )
            BEGIN
                SELECT
                    jp.jenis AS kategori,

                    -- STOK AWAL (Semua pergerakan SEBELUM PERIODE)
                    COALESCE((
                        SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN 1 ELSE -1 END)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id AND DATE(n2.tanggal) < PERIODE
                    ), 0) AS unit_awal,

                    COALESCE((
                        SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN p2.berat ELSE -p2.berat END)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id AND DATE(n2.tanggal) < PERIODE
                    ), 0) AS berat_awal,

                    -- MASUK HARI INI (Pas PERIODE)
                    COALESCE((
                        SELECT SUM(1)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = PERIODE AND n3.jenis = 'MASUK'
                    ), 0) AS unit_masuk,

                    COALESCE((
                        SELECT SUM(p3.berat)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id AND DATE(n3.tanggal) = PERIODE AND n3.jenis = 'MASUK'
                    ), 0) AS berat_masuk,

                    -- KELUAR HARI INI (Pas PERIODE)
                    COALESCE((
                        SELECT SUM(1)
                        FROM nampanproduk n4
                        JOIN produk p4 ON n4.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id AND DATE(n4.tanggal) = PERIODE AND n4.jenis = 'KELUAR'
                    ), 0) AS unit_keluar,

                    COALESCE((
                        SELECT SUM(p4.berat)
                        FROM nampanproduk n4
                        JOIN produk p4 ON n4.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id AND DATE(n4.tanggal) = PERIODE AND n4.jenis = 'KELUAR'
                    ), 0) AS berat_keluar,

                    -- STOK AKHIR (Kalkulasi Gabungan)
                    (
                        COALESCE((SELECT SUM(CASE WHEN n_a.jenis = 'MASUK' THEN 1 ELSE -1 END) FROM nampanproduk n_a JOIN produk p_a ON n_a.produk_id = p_a.id WHERE p_a.jenisproduk_id = jp.id AND DATE(n_a.tanggal) < PERIODE), 0) +
                        COALESCE((SELECT SUM(1) FROM nampanproduk n_m JOIN produk p_m ON n_m.produk_id = p_m.id WHERE p_m.jenisproduk_id = jp.id AND DATE(n_m.tanggal) = PERIODE AND n_m.jenis = 'MASUK'), 0) -
                        COALESCE((SELECT SUM(1) FROM nampanproduk n_k JOIN produk p_k ON n_k.produk_id = p_k.id WHERE p_k.jenisproduk_id = jp.id AND DATE(n_k.tanggal) = PERIODE AND n_k.jenis = 'KELUAR'), 0)
                    ) AS unit_akhir,

                    ROUND(
                        (
                            COALESCE((SELECT SUM(CASE WHEN n_ba.jenis = 'MASUK' THEN p_ba.berat ELSE -p_ba.berat END) FROM nampanproduk n_ba JOIN produk p_ba ON n_ba.produk_id = p_ba.id WHERE p_ba.jenisproduk_id = jp.id AND DATE(n_ba.tanggal) < PERIODE), 0) +
                            COALESCE((SELECT SUM(p_bm.berat) FROM nampanproduk n_bm JOIN produk p_bm ON n_bm.produk_id = p_bm.id WHERE p_bm.jenisproduk_id = jp.id AND DATE(n_bm.tanggal) = PERIODE AND n_bm.jenis = 'MASUK'), 0) -
                            COALESCE((SELECT SUM(p_bk.berat) FROM nampanproduk n_bk JOIN produk p_bk ON n_bk.produk_id = p_bk.id WHERE p_bk.jenisproduk_id = jp.id AND DATE(n_bk.tanggal) = PERIODE AND n_bk.jenis = 'KELUAR'), 0)
                        ), 3
                    ) AS berat_akhir

                FROM jenisproduk jp
                ORDER BY jp.jenis ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanStok');
    }
};
