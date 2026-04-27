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
                )
                SELECT
                    dt.tgl AS tanggal,
                    jp.jenis AS kategori,

                    -- STOK & BERAT AWAL
                    -- Logika: Barang yang masuk sebelum hari ini dan (belum terjual OR terjual HARI INI atau nanti)
                    COALESCE((
                        SELECT COUNT(*)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id
                          AND DATE(n2.tanggal) < dt.tgl
                          AND (n2.status = 1 OR (n2.status = 2 AND DATE(n2.updated_at) >= dt.tgl))
                    ), 0) AS unit_awal,

                    COALESCE((
                        SELECT SUM(p2.berat)
                        FROM nampanproduk n2
                        JOIN produk p2 ON n2.produk_id = p2.id
                        WHERE p2.jenisproduk_id = jp.id
                          AND DATE(n2.tanggal) < dt.tgl
                          AND (n2.status = 1 OR (n2.status = 2 AND DATE(n2.updated_at) >= dt.tgl))
                    ), 0) AS berat_awal,

                    -- MASUK HARI INI
                    COALESCE((
                        SELECT COUNT(*)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id
                          AND DATE(n3.tanggal) = dt.tgl
                    ), 0) AS unit_masuk,

                    COALESCE((
                        SELECT SUM(p3.berat)
                        FROM nampanproduk n3
                        JOIN produk p3 ON n3.produk_id = p3.id
                        WHERE p3.jenisproduk_id = jp.id
                          AND DATE(n3.tanggal) = dt.tgl
                    ), 0) AS berat_masuk,

                    -- KELUAR HARI INI
                    COALESCE((
                        SELECT COUNT(td.id)
                        FROM transaksidetail td
                        JOIN produk p4 ON td.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id
                          AND DATE(td.created_at) = dt.tgl
                          AND td.status = 2
                    ), 0) AS unit_keluar,

                    COALESCE((
                        SELECT SUM(td.berat)
                        FROM transaksidetail td
                        JOIN produk p4 ON td.produk_id = p4.id
                        WHERE p4.jenisproduk_id = jp.id
                          AND DATE(td.created_at) = dt.tgl
                          AND td.status = 2
                    ), 0) AS berat_keluar,

                    -- STOK & BERAT AKHIR (REVISED LOGIC)
                    -- Logika: Barang yang masuk sampai hari ini dan (belum terjual OR terjualnya baru BESOK)
                    -- Menggunakan > dt.tgl agar yang terjual hari ini sudah tidak dihitung di stok akhir hari ini.
                    COALESCE((
                        SELECT COUNT(*)
                        FROM nampanproduk n_a
                        JOIN produk p_a ON n_a.produk_id = p_a.id
                        WHERE p_a.jenisproduk_id = jp.id
                          AND DATE(n_a.tanggal) <= dt.tgl
                          AND (n_a.status = 1 OR (n_a.status = 2 AND DATE(n_a.updated_at) > dt.tgl))
                    ), 0) AS unit_akhir,

                    ROUND(
                        COALESCE((
                            SELECT SUM(p_a.berat)
                            FROM nampanproduk n_a
                            JOIN produk p_a ON n_a.produk_id = p_a.id
                            WHERE p_a.jenisproduk_id = jp.id
                              AND DATE(n_a.tanggal) <= dt.tgl
                              AND (n_a.status = 1 OR (n_a.status = 2 AND DATE(n_a.updated_at) > dt.tgl))
                        ), 0), 3
                    ) AS berat_akhir

                FROM deret_tanggal dt
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
