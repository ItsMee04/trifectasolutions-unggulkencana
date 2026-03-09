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
        DB::unprepared("DROP PROCEDURE IF EXISTS CetakLaporanMutasiSaldo;");

        DB::unprepared("
            CREATE PROCEDURE CetakLaporanMutasiSaldo(
                IN TANGGAL_AWAL DATE,
                IN TANGGAL_AKHIR DATE
            )
            BEGIN
                    SELECT

                    ms.tanggal,
                    ms.keterangan,
                    ms.jenis,
                    ms.jumlah,
                    s.rekening,
                    s.total,
                    pg.nama

                FROM mutasisaldo ms
                JOIN saldo s ON ms.saldo_id = s.id
                JOIN users u ON ms.oleh = u.id
                JOIN pegawai pg ON u.pegawai_id = pg.id
                WHERE s.status != 0
                AND DATE(ms.tanggal) BETWEEN TANGGAL_AWAL AND TANGGAL_AKHIR;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS CetakLaporanMutasiSaldo');
    }
};
