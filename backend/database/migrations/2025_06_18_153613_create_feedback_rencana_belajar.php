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
        Schema::create('feedback_rencana_belajar', function (Blueprint $table) {
            $table->id('idFeedbackRencanaBelajar');
            $table->dateTime('tglPemberianFeedback');
            $table->unsignedBigInteger('idPengajuanRencanaBelajar');
            $table->unsignedBigInteger('idInstruktur');

            $table->timestamps();

            $table->foreign('idPengajuanRencanaBelajar')->references('idPengajuanRencanaBelajar')->on('pengajuan_rencana_belajar');
            $table->foreign('idInstruktur')->references('idInstruktur')->on('instruktur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_rencana_belajar');
    }
};
