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
        Schema::create('harga', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('karat_id');
            $table->unsignedBigInteger('jeniskarat_id');
            $table->integer('harga')->unsigned()->default(0);
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('karat_id')->references('id')->on('karat')->onDelete('cascade');
            $table->foreign('jeniskarat_id')->references('id')->on('jeniskarat')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harga');
    }
};
