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
        Schema::create('mutasisaldo', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('saldo_id');
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->enum('jenis', ['MASUK', 'KELUAR']);
            $table->integer('jumlah')->unsigned()->default(0);
            $table->unsignedBigInteger('oleh');
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('oleh')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mutasisaldo');
    }
};
