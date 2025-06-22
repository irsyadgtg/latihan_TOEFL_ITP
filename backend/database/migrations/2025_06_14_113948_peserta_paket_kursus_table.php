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
        Schema::create('peserta_paket_kursus', function (Blueprint $table) {
            $table->id('idPesertaPaketKursus');
            $table->timestamp('tglMulai');
            $table->timestamp('tglBerakhir')->nullable();
            $table->boolean('statusAktif')->default(true);
            $table->boolean('paketSaatIni')->default(false);
            $table->unsignedBigInteger('idPeserta');
            $table->unsignedBigInteger('idPaketKursus');
            $table->timestamps();

            $table->foreign('idPeserta')->references('idPeserta')->on('peserta_kursus')->onDelete('cascade');
            $table->foreign('idPaketKursus')->references('idPaketKursus')->on('paket_kursus')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peserta_paket_kursus');
    }
};
