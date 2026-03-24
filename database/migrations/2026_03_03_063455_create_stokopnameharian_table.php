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
        Schema::create('stokopnameharian', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nampan_id');
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('oleh');
            $table->enum('statusstokopname', ['DRAFT', 'SELESAI','DISETUJUI'])->nullable()->default('DRAFT');
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('nampan_id')->references('id')->on('nampan')->onDelete('cascade');
            $table->foreign('oleh')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stokopnameharian');
    }
};
