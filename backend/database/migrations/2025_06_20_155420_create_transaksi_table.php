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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('idTransaksi');
            $table->string('kodeTransaksi', 30)->unique(); // <- Tambahan kode transaksi unik
            $table->unsignedBigInteger('nominal');
            $table->string('status')->default('PENDING');
            $table->string('buktiPembayaran');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('idPesertaPaketKursus');
            $table->foreign('idPesertaPaketKursus')->references('idPesertaPaketKursus')->on('peserta_paket_kursus');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
