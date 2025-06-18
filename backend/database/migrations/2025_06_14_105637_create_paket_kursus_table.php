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
        Schema::create('paket_kursus', function (Blueprint $table) {
            $table->id('idPaketKursus');
            $table->string('namaPaket');
            $table->decimal('harga', 10, 2); // Decimal untuk uang
            $table->integer('masaBerlaku'); // Misalnya dalam bulan
            $table->text('fasilitas');
            $table->boolean('aktif')->default(true); // true: aktif, false: non-aktif
            $table->unsignedBigInteger('idPegawai')->nullable();
            $table->foreign('idPegawai')->references('idPegawai')->on('pegawai')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_kursus');
    }
};
