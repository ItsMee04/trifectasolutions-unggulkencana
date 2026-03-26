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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanStokBulanan;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanStokBulanan(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                WITH RECURSIVE deret_tanggal AS (
                    SELECT TANGGAL_AWAL AS tgl
                    UNION ALL
                    SELECT tgl + INTERVAL 1 DAY
                    FROM deret_tanggal
                    WHERE tgl < TANGGAL_AKHIR
                ),
                tanggal_aktif AS (
                    SELECT DISTINCT tanggal
                    FROM nampanproduk
                    WHERE tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                      AND jenis IN ('MASUK', 'KELUAR')
                )
                SELECT
                    dt.tgl AS tanggal,
                    jp.jenis AS kategori,

                    -- STOK & BERAT AWAL (Semua sebelum tanggal baris ini)
                    COALESCE((
                        SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN 1 ELSE -1 END)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id
                          AND (n2.tanggal < dt.tgl OR n2.tanggal IS NULL)
                    ), 0) AS unit_awal,

                    COALESCE((
                        SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN p2.berat ELSE -p2.berat END)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id
                          AND (n2.tanggal < dt.tgl OR n2.tanggal IS NULL)
                    ), 0) AS berat_awal,

                    -- MASUK HARI INI
                    COALESCE((
                        SELECT SUM(1)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id
                          AND n3.tanggal = dt.tgl
                          AND n3.jenis = 'MASUK'
                    ), 0) AS unit_masuk,

                    COALESCE((
                        SELECT SUM(p3.berat)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id
                          AND n3.tanggal = dt.tgl
                          AND n3.jenis = 'MASUK'
                    ), 0) AS berat_masuk,

                    -- KELUAR HARI INI
                    COALESCE((
                        SELECT SUM(1)
                        FROM nampanproduk n4
                        JOIN produk p4 ON n4.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id
                          AND n4.tanggal = dt.tgl
                          AND n4.jenis = 'KELUAR'
                    ), 0) AS unit_keluar,

                    COALESCE((
                        SELECT SUM(p4.berat)
                        FROM nampanproduk n4
                        JOIN produk p4 ON n4.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id
                          AND n4.tanggal = dt.tgl
                          AND n4.jenis = 'KELUAR'
                    ), 0) AS berat_keluar,

                    -- STOK & BERAT AKHIR (Kalkulasi Gabungan)
                    (
                        COALESCE((SELECT SUM(CASE WHEN n_a.jenis = 'MASUK' THEN 1 ELSE -1 END) FROM nampanproduk n_a JOIN produk p_a ON n_a.produk_id = p_a.id WHERE p_a.jenisproduk_id = jp.id AND (n_a.tanggal < dt.tgl OR n_a.tanggal IS NULL)), 0) +
                        COALESCE((SELECT SUM(1) FROM nampanproduk n_m JOIN produk p_m ON n_m.produk_id = p_m.id WHERE p_m.jenisproduk_id = jp.id AND n_m.tanggal = dt.tgl AND n_m.jenis = 'MASUK'), 0) -
                        COALESCE((SELECT SUM(1) FROM nampanproduk n_k JOIN produk p_k ON n_k.produk_id = p_k.id WHERE p_k.jenisproduk_id = jp.id AND n_k.tanggal = dt.tgl AND n_k.jenis = 'KELUAR'), 0)
                    ) AS unit_akhir,

                    ROUND(
                        (
                            COALESCE((SELECT SUM(CASE WHEN n_ba.jenis = 'MASUK' THEN p_ba.berat ELSE -p_ba.berat END) FROM nampanproduk n_ba JOIN produk p_ba ON n_ba.produk_id = p_ba.id WHERE p_ba.jenisproduk_id = jp.id AND (n_ba.tanggal < dt.tgl OR n_ba.tanggal IS NULL)), 0) +
                            COALESCE((SELECT SUM(p_bm.berat) FROM nampanproduk n_bm JOIN produk p_bm ON n_bm.produk_id = p_bm.id WHERE p_bm.jenisproduk_id = jp.id AND n_bm.tanggal = dt.tgl AND n_bm.jenis = 'MASUK'), 0) -
                            COALESCE((SELECT SUM(p_bk.berat) FROM nampanproduk n_bk JOIN produk p_bk ON n_bk.produk_id = p_bk.id WHERE p_bk.jenisproduk_id = jp.id AND n_bk.tanggal = dt.tgl AND n_bk.jenis = 'KELUAR'), 0)
                        ), 3
                    ) AS berat_akhir

                FROM deret_tanggal dt
                JOIN tanggal_aktif ta ON dt.tgl = ta.tanggal
                CROSS JOIN jenisproduk jp
                ORDER BY dt.tgl ASC, jp.jenis ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanStokBulanan');
    }
};
