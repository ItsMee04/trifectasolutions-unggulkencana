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
        Schema::create('stokdetail', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 100);
            $table->unsignedBigInteger('jenisproduk_id')->nullable();
            $table->integer('potong')->unsigned()->default(0);
            $table->decimal('berat', 8, 2)->nullable()->default(0.0);
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('jenisproduk_id')->references('id')->on('jenisproduk')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stokdetail');
    }
};
