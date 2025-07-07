<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 🔥 FINAL SIMULATION TABLE - GABUNGAN SEMUA UPDATE UNTUK TIMER RESUME
     * 
     * FIELDS BARU UNTUK TIMER RESUME:
     * - listening_started_at, structure_started_at, reading_started_at (timestamp section)
     * - last_timer_sync (untuk sync periodik)
     * 
     * SEMUA FIELD YANG SUDAH ADA SEBELUMNYA TETAP DIPERTAHANKAN
     */
    public function up(): void
    {
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            
            // User relationship
            $table->unsignedBigInteger('idPengguna');
            $table->foreign('idPengguna')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            //  Simulation set relationship
            $table->foreignId('simulation_set_id')->constrained('simulation_sets')->onDelete('cascade');
            
            // Status tracking
            $table->enum('status', [
                'not_started',
                'in_progress_listening', 
                'in_progress_structure', 
                'in_progress_reading', 
                'completed'
            ])->default('not_started');
            
            //  EXISTING: Global simulation timestamps
            $table->timestamp('started_at')->nullable(); // When simulation first started
            $table->timestamp('finished_at')->nullable(); // When simulation completed
            
            //  NEW: PER-SECTION START TIMESTAMPS - INI YANG DIPERLUKAN UNTUK RESUME TIMER
            $table->timestamp('listening_started_at')->nullable(); // When listening section started
            $table->timestamp('structure_started_at')->nullable(); // When structure section started  
            $table->timestamp('reading_started_at')->nullable(); // When reading section started
            
            //  EXISTING: Time spent per section (in seconds)
            $table->integer('time_spent_listening')->nullable();
            $table->integer('time_spent_structure')->nullable();
            $table->integer('time_spent_reading')->nullable();
            
            //  NEW: Timer sync tracking
            $table->timestamp('last_timer_sync')->nullable(); // Last time frontend synced timer
            
            // EXISTING: Scores
            $table->unsignedSmallInteger('score_listening')->nullable();
            $table->unsignedSmallInteger('score_structure')->nullable();
            $table->unsignedSmallInteger('score_reading')->nullable();
            $table->unsignedSmallInteger('total_score')->nullable();
            
            //  Laravel timestamps
            $table->timestamps();
            
            //  Indexes for performance
            $table->index(['idPengguna', 'simulation_set_id']);
            $table->index(['idPengguna', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('simulations');
    }
};