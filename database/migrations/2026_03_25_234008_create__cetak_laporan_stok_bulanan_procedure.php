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
                    SELECT DISTINCT CAST(tanggal AS CHAR) as tgl_filtered
                    FROM nampanproduk
                    WHERE CAST(tanggal AS CHAR) BETWEEN CAST(TANGGAL_AWAL AS CHAR) AND CAST(TANGGAL_AKHIR AS CHAR)
                      AND jenis IN ('MASUK', 'KELUAR')
                )
                SELECT
                    dt.tgl AS tanggal,
                    jp.jenis AS kategori,

                    -- UNIT AWAL (Saldo sebelum tanggal baris ini + Data Inisial 0000)
                    COALESCE((
                        SELECT SUM(CASE WHEN n2.jenis = 'MASUK' THEN 1 ELSE -1 END)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id
                          AND (
                            n2.tanggal IS NULL
                            OR CAST(n2.tanggal AS CHAR) = '0000-00-00'
                            OR CAST(n2.tanggal AS CHAR) = ''
                            OR (CAST(n2.tanggal AS CHAR) > '0000-00-00' AND CAST(n2.tanggal AS CHAR) < CAST(dt.tgl AS CHAR))
                          )
                    ), 0) AS unit_awal,

                    -- UNIT MASUK (Hari Ini)
                    COALESCE((
                        SELECT COUNT(*)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id
                          AND CAST(n3.tanggal AS CHAR) = CAST(dt.tgl AS CHAR)
                          AND n3.jenis = 'MASUK'
                    ), 0) AS unit_masuk,

                    -- UNIT KELUAR (Hari Ini)
                    COALESCE((
                        SELECT COUNT(*)
                        FROM nampanproduk n4
                        JOIN produk p4 ON n4.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id
                          AND CAST(n4.tanggal AS CHAR) = CAST(dt.tgl AS CHAR)
                          AND n4.jenis = 'KELUAR'
                    ), 0) AS unit_keluar,

                    -- UNIT AKHIR (Kalkulasi Saldo Berjalan)
                    (
                        COALESCE((SELECT SUM(CASE WHEN n_a.jenis = 'MASUK' THEN 1 ELSE -1 END) FROM nampanproduk n_a JOIN produk p_a ON n_a.produk_id = p_a.id WHERE p_a.jenisproduk_id = jp.id AND (CAST(n_a.tanggal AS CHAR) <= '0000-00-00' OR CAST(n_a.tanggal AS CHAR) < CAST(dt.tgl AS CHAR))), 0) +
                        COALESCE((SELECT COUNT(*) FROM nampanproduk n_m JOIN produk p_m ON n_m.produk_id = p_m.id WHERE p_m.jenisproduk_id = jp.id AND CAST(n_m.tanggal AS CHAR) = CAST(dt.tgl AS CHAR) AND n_m.jenis = 'MASUK'), 0) -
                        COALESCE((SELECT COUNT(*) FROM nampanproduk n_k JOIN produk p_k ON n_k.produk_id = p_k.id WHERE p_k.jenisproduk_id = jp.id AND CAST(n_k.tanggal AS CHAR) = CAST(dt.tgl AS CHAR) AND n_k.jenis = 'KELUAR'), 0)
                    ) AS unit_akhir

                FROM deret_tanggal dt
                JOIN tanggal_aktif ta ON CAST(dt.tgl AS CHAR) = ta.tgl_filtered
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
