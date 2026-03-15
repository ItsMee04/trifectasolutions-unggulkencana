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
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                WITH RECURSIVE deret_tanggal AS (
                    SELECT TANGGAL_AWAL AS tanggal
                    UNION ALL
                    SELECT DATE_ADD(tanggal, INTERVAL 1 DAY)
                    FROM deret_tanggal
                    WHERE tanggal < TANGGAL_AKHIR
                ),
                kategori_hari AS (
                    SELECT d.tanggal, jp.id AS jenisproduk_id, jp.jenis
                    FROM deret_tanggal d
                    CROSS JOIN jenisproduk jp
                ),
                transaksi_data AS (
                    SELECT
                        DATE(n.tanggal) as tgl,
                        p.jenisproduk_id,
                        n.jenis as tipe,
                        1 as pt,
                        p.berat as gr
                    FROM nampanproduk n
                    JOIN produk p ON n.produk_id = p.id
                    WHERE DATE(n.tanggal) BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                )
                -- Langsung SELECT datanya tanpa UNION ALL TOTAL
                SELECT
                    DATE_FORMAT(kh.tanggal, '%d-%m-%Y') as tgl,

                    -- ANTING
                    SUM(CASE WHEN kh.jenis = 'ANTING' AND td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as anting_m_pt,
                    SUM(CASE WHEN kh.jenis = 'ANTING' AND td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as anting_m_gr,
                    SUM(CASE WHEN kh.jenis = 'ANTING' AND td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as anting_k_pt,
                    SUM(CASE WHEN kh.jenis = 'ANTING' AND td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as anting_k_gr,

                    -- CINCIN
                    SUM(CASE WHEN kh.jenis = 'CINCIN' AND td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as cincin_m_pt,
                    SUM(CASE WHEN kh.jenis = 'CINCIN' AND td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as cincin_m_gr,
                    SUM(CASE WHEN kh.jenis = 'CINCIN' AND td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as cincin_k_pt,
                    SUM(CASE WHEN kh.jenis = 'CINCIN' AND td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as cincin_k_gr,

                    -- GELANG
                    SUM(CASE WHEN kh.jenis = 'GELANG' AND td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as gelang_m_pt,
                    SUM(CASE WHEN kh.jenis = 'GELANG' AND td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as gelang_m_gr,
                    SUM(CASE WHEN kh.jenis = 'GELANG' AND td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as gelang_k_pt,
                    SUM(CASE WHEN kh.jenis = 'GELANG' AND td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as gelang_k_gr,

                    -- KALUNG
                    SUM(CASE WHEN kh.jenis = 'KALUNG' AND td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as kalung_m_pt,
                    SUM(CASE WHEN kh.jenis = 'KALUNG' AND td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as kalung_m_gr,
                    SUM(CASE WHEN kh.jenis = 'KALUNG' AND td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as kalung_k_pt,
                    SUM(CASE WHEN kh.jenis = 'KALUNG' AND td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as kalung_k_gr,

                    -- SUBENG
                    SUM(CASE WHEN kh.jenis = 'SUBENG' AND td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as subeng_m_pt,
                    SUM(CASE WHEN kh.jenis = 'SUBENG' AND td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as subeng_m_gr,
                    SUM(CASE WHEN kh.jenis = 'SUBENG' AND td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as subeng_k_pt,
                    SUM(CASE WHEN kh.jenis = 'SUBENG' AND td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as subeng_k_gr,

                    -- TOTAL PER TANGGAL
                    SUM(CASE WHEN td.tipe = 'MASUK' THEN td.pt ELSE 0 END) as total_m_pt,
                    SUM(CASE WHEN td.tipe = 'MASUK' THEN td.gr ELSE 0 END) as total_m_gr,
                    SUM(CASE WHEN td.tipe = 'KELUAR' THEN td.pt ELSE 0 END) as total_k_pt,
                    SUM(CASE WHEN td.tipe = 'KELUAR' THEN td.gr ELSE 0 END) as total_k_gr

                FROM kategori_hari kh
                LEFT JOIN transaksi_data td ON kh.tanggal = td.tgl AND kh.jenisproduk_id = td.jenisproduk_id
                GROUP BY kh.tanggal
                ORDER BY kh.tanggal ASC;
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
