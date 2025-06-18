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
        Schema::create('peserta_kursus', function (Blueprint $table) {
            $table->id('idPeserta');
            $table->string('namaLengkap');
            $table->text('alamat')->nullable();
            $table->string('nomorTelepon')->nullable();
            $table->string('urlFotoProfil')->nullable();
            $table->string('status');
            $table->string('nik')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peserta_kursus');
    }
};
