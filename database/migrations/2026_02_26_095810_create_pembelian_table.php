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
        Schema::create('pembelian', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 100)->unique();
            $table->unsignedBigInteger('suplier_id')->nullable();
            $table->unsignedBigInteger('pelanggan_id')->nullable();
            $table->date('tanggal')->nullable();
            $table->enum('jenis', ['DARITOKO', 'LUARTOKO']);
            $table->integer('total')->default(0);
            $table->string('terbilang')->nullable();
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('oleh');
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->timestamps();

            // Relasi
            $table->foreign('suplier_id')->references('id')->on('suplier')->nullOnDelete();
            $table->foreign('pelanggan_id')->references('id')->on('pelanggan')->nullOnDelete();
            $table->foreign('oleh')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembelian');
    }
};
