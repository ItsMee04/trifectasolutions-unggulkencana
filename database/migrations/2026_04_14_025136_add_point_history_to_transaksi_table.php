<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            // point_dapat: poin yang diperoleh dari berat produk
            // point_dipakai: poin yang dipotong karena digunakan sebagai diskon
            $table->integer('point_dapat')->default(0)->after('total');
            $table->integer('point_dipakai')->default(0)->after('point_dapat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropColumn(['point_dapat', 'point_dipakai']);
        });
    }
};
