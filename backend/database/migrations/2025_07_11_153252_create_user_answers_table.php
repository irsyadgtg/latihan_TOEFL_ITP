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
        Schema::create('user_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('idPengguna');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->enum('selected_option', ['a', 'b', 'c', 'd']);
            $table->boolean('is_correct');
            $table->foreignId('simulation_id')->nullable()->constrained('simulations')->onDelete('cascade');
            $table->timestamps();
            
            // Foreign key ke table pengguna
            $table->foreign('idPengguna')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            // Index for performance
            $table->index(['idPengguna', 'question_id']);
            $table->index(['idPengguna', 'simulation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_answers');
    }
};