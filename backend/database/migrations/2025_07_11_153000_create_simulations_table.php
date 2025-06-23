<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            
            // ✅ FIXED: idPengguna foreign key ke tabel pengguna
            $table->unsignedBigInteger('idPengguna');
            $table->foreign('idPengguna')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            // ✅ simulation_set_id foreign key
            $table->foreignId('simulation_set_id')->constrained('simulation_sets')->onDelete('cascade');
            
            // ✅ GABUNGAN: Status dan time tracking dari migration kedua
            $table->enum('status', [
                'not_started',
                'in_progress_listening', 
                'in_progress_structure', 
                'in_progress_reading', 
                'completed'
            ])->default('not_started');
            
            // ✅ Time tracking fields
            $table->integer('time_spent_listening')->nullable();
            $table->integer('time_spent_structure')->nullable();
            $table->integer('time_spent_reading')->nullable();
            
            // ✅ Timestamps dan scores
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedSmallInteger('score_listening')->nullable();
            $table->unsignedSmallInteger('score_structure')->nullable();
            $table->unsignedSmallInteger('score_reading')->nullable();
            $table->unsignedSmallInteger('total_score')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulations');
    }
};