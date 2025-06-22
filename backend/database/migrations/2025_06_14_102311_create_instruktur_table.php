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
        Schema::create('instruktur', function (Blueprint $table) {
            $table->id('idInstruktur');
            $table->string('keahlian');
            $table->time('waktuMulai');
            $table->time('waktuBerakhir');
            $table->date('tglKetersediaan');
            $table->unsignedBigInteger('idPegawai')->nullable();
            $table->foreign('idPegawai')->references('idPegawai')->on('pegawai')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instruktur');
    }
};
