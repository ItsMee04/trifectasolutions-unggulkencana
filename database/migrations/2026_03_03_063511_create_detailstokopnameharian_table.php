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
        Schema::create('detailstokopnameharian', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('stokopnameharian_id');
            $table->unsignedBigInteger('produk_id');
            $table->decimal('berat', 8, 3)->nullable()->default(0.0);
            $table->text('keterangan')->nullable();
            $table->enum('statusproduk', ['SESUAI', 'HILANG', 'TEMUAN', 'RUSAK']);
            $table->integer('status')->unsigned()->default(1);
            $table->timestamps();

            $table->foreign('stokopnameharian_id')->references('id')->on('stokopnameharian')->onDelete('cascade');
            $table->foreign('produk_id')->references('id')->on('produk')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detailstokopnameharian');
    }
};
