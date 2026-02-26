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
        Schema::create('pembeliandetail', function (Blueprint $table) {
            $table->id();
            $table->string('kodetransaksi', 100)->nullable();
            $table->string('kode', 100); // relasi ke pembelian (kode, bukan id)
            $table->unsignedBigInteger('produk_id')->nullable();
            $table->unsignedBigInteger('hargabeli')->default(0);
            $table->decimal('berat', 8, 3)->nullable()->default(0.000);
            $table->unsignedBigInteger('karat')->nullable();
            $table->unsignedBigInteger('lingkar')->nullable();
            $table->unsignedBigInteger('panjang')->nullable();
            $table->unsignedBigInteger('kondisi_id')->nullable();
            $table->enum('jenis', ['DARITOKO', 'LUARTOKO']);
            $table->string('jenis_hargabeli')->nullable();
            $table->unsignedBigInteger('total')->default(0);
            $table->string('terbilang')->nullable();
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('oleh');
            $table->tinyInteger('status')->default(1);
            $table->timestamps();

            // Relasi
            $table->foreign('kode')->references('kode')->on('pembelian')->cascadeOnDelete();
            $table->foreign('produk_id')->references('id')->on('produk')->nullOnDelete();
            $table->foreign('kondisi_id')->references('id')->on('kondisi')->nullOnDelete();
            $table->foreign('oleh')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembeliandetail');
    }
};
