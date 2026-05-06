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
                SELECT
                    tanggal,
                    nama_baki,
                    kategori,
                    kodeproduk,
                    nama_produk,
                    berat,
                    kadar,
                    pergerakan,
                    status_data
                FROM (
                    -- 1. BAGIAN DETAIL PRODUK
                    -- Menampilkan semua riwayat masuk, keluar, atau pindah
                    SELECT
                        n.tanggal AS tanggal,
                        n.nampan AS nama_baki,
                        jp.jenis AS kategori,
                        p.kodeproduk AS kodeproduk,
                        p.nama AS nama_produk,
                        p.berat AS berat,
                        k.karat AS kadar,
                        np.jenis AS pergerakan,   -- MASUK / KELUAR / PINDAH
                        np.status AS status_data,  -- 1: Aktif, 2: Terjual, 0: Dihapus
                        jp.urutan AS urutan_kat,   -- Sesuai urutan master jenisproduk
                        1 AS tipe_baris            -- Prioritas tampilan pertama
                    FROM nampan n
                    JOIN nampanproduk np ON n.id = np.nampan_id
                    JOIN produk p ON np.produk_id = p.id
                    JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                    JOIN karat k ON p.karat_id = k.id
                    WHERE n.tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR

                    UNION ALL

                    -- 2. BAGIAN RINGKASAN (TOTAL PER BAKI)
                    -- Hanya menghitung barang yang MASUK dan STATUS 1 (Tersedia)
                    SELECT
                        n.tanggal AS tanggal,
                        n.nampan AS nama_baki,
                        jp.jenis AS kategori,
                        '>> TOTAL' AS kodeproduk,
                        CONCAT(COUNT(p.id), ' Unit Aktif') AS nama_produk,
                        SUM(p.berat) AS berat,
                        NULL AS kadar,
                        'RINGKASAN' AS pergerakan,
                        1 AS status_data,
                        jp.urutan AS urutan_kat,
                        2 AS tipe_baris            -- Muncul tepat di bawah detail produk
                    FROM nampan n
                    JOIN nampanproduk np ON n.id = np.nampan_id
                    JOIN produk p ON np.produk_id = p.id
                    JOIN jenisproduk jp ON p.jenisproduk_id = jp.id
                    WHERE n.tanggal BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR
                      AND np.jenis = 'MASUK'
                      AND np.status = 1            -- KUNCI: Hanya yang masih di nampan
                    GROUP BY n.tanggal, n.id, n.nampan, jp.jenis, jp.urutan
                ) AS gabungan
                ORDER BY
                    tanggal ASC,
                    nama_baki ASC,
                    urutan_kat ASC,
                    tipe_baris ASC,
                    kodeproduk ASC;
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
