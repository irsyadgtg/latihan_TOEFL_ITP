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
        Schema::create('pengajuan_rencana_belajar', function (Blueprint $table) {
            $table->id('idPengajuanRencanaBelajar');
            $table->string('namaRencana');
            $table->integer('targetSkor');
            $table->string('targetWaktu');
            $table->integer('hariPerMinggu');
            $table->string('jamPerHari');
            $table->dateTime('tglPengajuan');
            $table->string('status');
            $table->boolean('isAktif')->default(true);
            $table->dateTime('tanggalMulai')->nullable();
            $table->dateTime('selesaiPada')->nullable();

            $table->unsignedBigInteger('idPengajuanSkorAwal');
            $table->unsignedBigInteger('idPeserta');

            $table->timestamps();

            $table->foreign('idPengajuanSkorAwal')->references('idPengajuanSkorAwal')->on('pengajuan_skor_awal');
            $table->foreign('idPeserta')->references('idPeserta')->on('peserta_kursus');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_rencana_belajar');
    }
};
