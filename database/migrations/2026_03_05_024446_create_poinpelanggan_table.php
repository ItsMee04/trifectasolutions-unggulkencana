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
        Schema::create('poinpelanggan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pelanggan_id');
            $table->string('kode');
            $table->integer('jumlah');
            $table->unsignedBigInteger('oleh');
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('pelanggan_id')->references('id')->on('pelanggan')->onDelete('cascade');
            $table->foreign('kode')->references('kode')->on('transaksi')->onDelete('cascade');
            $table->foreign('oleh')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poinpelanggan');
    }
};
