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
        Schema::create('detail_feedback_rencana_belajar', function (Blueprint $table) {
            $table->id('idDetailFeedback');
            $table->unsignedBigInteger('idSkill');
            $table->unsignedBigInteger('idFeedbackRencanaBelajar');

            $table->timestamps();

            $table->foreign('idSkill')->references('idSkill')->on('skill');
            $table->foreign('idFeedbackRencanaBelajar')->references('idFeedbackRencanaBelajar')->on('feedback_rencana_belajar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_feedback_rencana_belajar');
    }
};
