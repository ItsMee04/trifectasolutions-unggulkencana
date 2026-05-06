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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanNampan;");

        DB::unprepared("
        CREATE PROCEDURE CetakLaporanNampan(
            IN TANGGAL_AWAL DATE,
            IN TANGGAL_AKHIR DATE
        )
        BEGIN
            SELECT
                nama_baki,
                kategori,
                kodeproduk,
                nama_produk,
                berat,
                kadar,
                pergerakan,
                status_data
            FROM (
                -- Tampilkan semua riwayat agar terlihat mana yang keluar/dihapus
                SELECT
                    n.nampan AS nama_baki,
                    jp.jenis AS kategori,
                    p.kodeproduk AS kodeproduk,
                    p.nama AS nama_produk,
                    p.berat AS berat,
                    k.karat AS kadar,
                    np.jenis AS pergerakan,
                    np.status AS status_data,
                    jp.urutan AS urutan_kat,
                    1 AS tipe_baris
                FROM nampan n
                JOIN nampanproduk np ON n.id = np.nampan_id
                JOIN produk p ON np.produk_id = p.id
                JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                JOIN karat k ON p.karat_id = k.id
                WHERE n.tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR

                UNION ALL

                -- Baris Kalkulasi Stok yang Masih Ada (Status 1 & Masuk)
                SELECT
                    n.nampan AS nama_baki,
                    jp.jenis AS kategori,
                    '>> TOTAL STOK' AS kodeproduk,
                    CONCAT(COUNT(p.id), ' Item Tersedia') AS nama_produk,
                    SUM(p.berat) AS berat,
                    NULL AS kadar,
                    'RINGKASAN' AS pergerakan,
                    1 AS status_data,
                    jp.urutan AS urutan_kat,
                    2 AS tipe_baris
                FROM nampan n
                JOIN nampanproduk np ON n.id = np.nampan_id
                JOIN produk p ON np.produk_id = p.id
                JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                WHERE n.tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                  AND np.jenis = 'MASUK'
                  AND np.status = 1
                GROUP BY n.id, n.nampan, jp.jenis, jp.urutan
            ) AS gabungan
            ORDER BY nama_baki ASC, urutan_kat ASC, tipe_baris ASC, kodeproduk ASC;
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
