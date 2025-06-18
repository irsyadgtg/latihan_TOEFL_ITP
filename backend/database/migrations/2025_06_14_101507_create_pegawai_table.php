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
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id('idPegawai');
            $table->string('nik_nip')->unique();
            $table->string('jabatan');
            $table->string('namaLengkap');
            $table->string('nomorTelepon')->nullable();
            $table->text('alamat')->nullable();
            $table->string('urlFotoProfil')->nullable();
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
