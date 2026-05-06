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
                    main.tanggal,
                    main.kategori,
                    main.unit_awal,
                    main.berat_awal,
                    main.unit_masuk,
                    main.berat_masuk,
                    main.unit_keluar,
                    main.berat_keluar,
                    -- HITUNGAN MATEMATIKA PASTI AGAR SINKRON
                    (main.unit_awal + main.unit_masuk - main.unit_keluar) AS unit_akhir,
                    ROUND((main.berat_awal + main.berat_masuk - main.berat_keluar), 3) AS berat_akhir
                FROM (
                    SELECT
                        dt.tgl AS tanggal,
                        jp.jenis AS kategori,
                        jp.urutan AS urutan_kategori,

                        -- UNIT AWAL: Akumulasi Masuk vs Keluar di masa lalu
                        COALESCE((
                            SELECT COUNT(n_in.id) FROM nampanproduk n_in
                            JOIN produk p_in ON n_in.produk_id = p_in.id
                            WHERE p_in.jenisproduk_id = jp.id
                              AND n_in.jenis = 'MASUK'
                              AND DATE(n_in.tanggal) < dt.tgl
                        ), 0) -
                        COALESCE((
                            SELECT COUNT(td_out.id) FROM transaksidetail td_out
                            JOIN produk p_out ON td_out.produk_id = p_out.id
                            WHERE p_out.jenisproduk_id = jp.id
                              AND td_out.status = 2
                              AND DATE(td_out.created_at) < dt.tgl
                        ), 0) AS unit_awal,

                        COALESCE((
                            SELECT SUM(p_in.berat) FROM nampanproduk n_in
                            JOIN produk p_in ON n_in.produk_id = p_in.id
                            WHERE p_in.jenisproduk_id = jp.id
                              AND n_in.jenis = 'MASUK'
                              AND DATE(n_in.tanggal) < dt.tgl
                        ), 0) -
                        COALESCE((
                            SELECT SUM(td_out.berat) FROM transaksidetail td_out
                            JOIN produk p_out ON td_out.produk_id = p_out.id
                            WHERE p_out.jenisproduk_id = jp.id
                              AND td_out.status = 2
                              AND DATE(td_out.created_at) < dt.tgl
                        ), 0) AS berat_awal,

                        -- MASUK HARI INI
                        COALESCE((
                            SELECT COUNT(*) FROM nampanproduk n3
                            JOIN produk p3 ON n3.produk_id = p3.id
                            WHERE p3.jenisproduk_id = jp.id AND n3.jenis = 'MASUK' AND DATE(n3.tanggal) = dt.tgl
                        ), 0) AS unit_masuk,

                        COALESCE((
                            SELECT SUM(p3.berat) FROM nampanproduk n3
                            JOIN produk p3 ON n3.produk_id = p3.id
                            WHERE p3.jenisproduk_id = jp.id AND n3.jenis = 'MASUK' AND DATE(n3.tanggal) = dt.tgl
                        ), 0) AS berat_masuk,

                        -- KELUAR HARI INI (Dari Transaksi)
                        COALESCE((
                            SELECT COUNT(td.id) FROM transaksidetail td
                            JOIN produk p4 ON td.produk_id = p4.id
                            WHERE p4.jenisproduk_id = jp.id AND DATE(td.created_at) = dt.tgl AND td.status = 2
                        ), 0) AS unit_keluar,

                        COALESCE((
                            SELECT SUM(td.berat) FROM transaksidetail td
                            JOIN produk p4 ON td.produk_id = p4.id
                            WHERE p4.jenisproduk_id = jp.id AND DATE(td.created_at) = dt.tgl AND td.status = 2
                        ), 0) AS berat_keluar

                    FROM deret_tanggal dt
                    CROSS JOIN jenisproduk jp
                ) AS main
                ORDER BY main.tanggal ASC, main.urutan_kategori ASC;
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
