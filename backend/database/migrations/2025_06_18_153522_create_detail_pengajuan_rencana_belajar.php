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
        Schema::create('detail_pengajuan_rencana_belajar', function (Blueprint $table) {
            $table->id('idDetailPengajuan');
            $table->unsignedBigInteger('idSkill');
            $table->unsignedBigInteger('idPengajuanRencanaBelajar');

            $table->timestamps();

            $table->foreign('idSkill')
                ->references('idSkill')
                ->on('skill')
                ->name('fk_pengajuan_skill');

            $table->foreign('idPengajuanRencanaBelajar')
                ->references('idPengajuanRencanaBelajar')
                ->on('pengajuan_rencana_belajar')
                ->name('fk_pengajuan_rencana');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_pengajuan_rencana_belajar');
    }
};
