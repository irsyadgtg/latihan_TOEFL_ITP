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
        Schema::create('pengajuan_skor_awal', function (Blueprint $table) {
            $table->id('idPengajuanSkorAwal');
            $table->string('namaTes');
            $table->integer('skor');
            $table->string('urlDokumenPendukung');
            $table->timestamp('tglPengajuan');
            $table->string('status');
            $table->date('masaBerlakuDokumen')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamp('tglSeleksi')->nullable();
            $table->unsignedBigInteger('idPeserta');
            $table->unsignedBigInteger('idPegawai')->nullable();
            $table->foreign('idPeserta')->references('idPeserta')->on('peserta_kursus')->onDelete('cascade');
            $table->foreign('idPegawai')->references('idPegawai')->on('pegawai')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_skor_awal');
    }
};
