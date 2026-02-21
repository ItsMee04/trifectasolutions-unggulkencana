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
        Schema::create('nampan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jenisproduk_id');
            $table->string('nampan', 100);
            $table->date('tanggal');
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
        Schema::dropIfExists('nampan');
    }
};
