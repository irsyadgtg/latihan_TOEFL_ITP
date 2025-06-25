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
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();

            // Foreign keys ke pengguna table dengan idPengguna field
            $table->unsignedBigInteger('student_id');
            $table->foreign('student_id')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            $table->unsignedBigInteger('instructor_id');
            $table->foreign('instructor_id')->references('idPengguna')->on('pengguna')->onDelete('cascade');
            
            $table->string('topic')->nullable();
            $table->enum('status', ['pending', 'active', 'closed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};