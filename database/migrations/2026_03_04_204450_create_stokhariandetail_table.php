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
        Schema::create('stokhariandetail', function (Blueprint $table) {
            $table->id();
            $table->string('kode');
            $table->unsignedBigInteger('nampan_id');
            $table->unsignedBigInteger('oleh');
            $table->integer('status')->default(1);
            $table->timestamps();

            $table->foreign('kode')->references('kode')->on('stokharian')->onDelete('cascade');
            $table->foreign('nampan_id')->references('id')->on('nampan')->onDelete('cascade');
            $table->foreign('oleh')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stokhariandetail');
    }
};
