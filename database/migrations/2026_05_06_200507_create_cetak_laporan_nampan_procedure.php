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
        // Bersihkan procedure lama jika ada
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanNampan;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanNampan(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                WITH RECURSIVE tanggal_range AS (
                SELECT DATE(TANGGAL_AWAL) AS tanggal

                UNION ALL

                SELECT DATE_ADD(tanggal, INTERVAL 1 DAY)
                FROM tanggal_range
                WHERE tanggal < TANGGAL_AKHIR
            ),

            last_log AS (
                SELECT
                    tr.tanggal AS tanggal_laporan,
                    np.produk_id,
                    MAX(np.id) AS last_id
                FROM tanggal_range tr
                JOIN nampanproduk np
                    ON np.tanggal <= tr.tanggal
                GROUP BY
                    tr.tanggal,
                    np.produk_id
            ),

            stok_aktif AS (
                SELECT
                    ll.tanggal_laporan,
                    np.nampan_id,
                    np.produk_id,
                    np.jenis,
                    np.status
                FROM last_log ll
                JOIN nampanproduk np
                    ON np.id = ll.last_id
                WHERE
                    np.jenis = 'MASUK'
            )

            SELECT
                sa.tanggal_laporan AS tanggal,

                n.nampan,

                p.kodeproduk,
                p.nama,
                p.berat,

                kr.karat,

                sa.jenis,
                sa.status,

                COUNT(sa.produk_id)
                OVER (
                    PARTITION BY sa.tanggal_laporan, n.id
                ) AS total_item,

                SUM(p.berat)
                OVER (
                    PARTITION BY sa.tanggal_laporan, n.id
                ) AS total_berat

            FROM stok_aktif sa

            JOIN nampan n
                ON sa.nampan_id = n.id

            JOIN produk p
                ON sa.produk_id = p.id

            JOIN karat kr
                ON p.karat_id = kr.id

            ORDER BY
                sa.tanggal_laporan,
                n.nampan,
                p.nama;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanNampan');
    }
};
