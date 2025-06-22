<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('idPengguna');
            $table->foreignId('page_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Foreign key ke table pengguna
            $table->foreign('idPengguna')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            // Ensure one record per user per page
            $table->unique(['idPengguna', 'page_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_progress');
    }
};