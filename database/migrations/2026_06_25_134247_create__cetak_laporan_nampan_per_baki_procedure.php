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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanNampanPerBaki;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanNampanPerBaki(
                IN TARGET_TANGGAL DATE
            )
            BEGIN
                SELECT
                    n.nampan,

                    -- 1. METRIK AKUMULATIF (Dari awal sampai target tanggal)
                    SUM(CASE WHEN np.status = 1 THEN p.berat ELSE 0 END) AS totalberat,
                    SUM(CASE WHEN np.status = 1 THEN 1 ELSE 0 END) AS totalitem,

                    -- 2. METRIK SPESIFIK HARI H (Hanya pada target tanggal)
                    SUM(CASE WHEN np.tanggal = TARGET_TANGGAL AND np.jenis = 'MASUK' THEN 1 ELSE 0 END) AS totalitemmasuk,
                    SUM(CASE WHEN np.tanggal = TARGET_TANGGAL AND np.jenis = 'MASUK' THEN p.berat ELSE 0 END) AS totalberatmasuk,
                    SUM(CASE WHEN np.tanggal = TARGET_TANGGAL AND np.jenis = 'KELUAR' THEN 1 ELSE 0 END) AS totalitemkeluar,
                    SUM(CASE WHEN np.tanggal = TARGET_TANGGAL AND np.jenis = 'KELUAR' THEN p.berat ELSE 0 END) AS totalberatkeluar
                FROM nampanproduk np
                JOIN nampan n ON np.nampan_id = n.id
                JOIN produk p ON np.produk_id = p.id
                WHERE np.tanggal <= TARGET_TANGGAL
                GROUP BY n.id, n.nampan
                ORDER BY n.id ASC;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanNampanPerBaki');
    }
};
