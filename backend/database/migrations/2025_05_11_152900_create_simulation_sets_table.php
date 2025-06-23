<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_sets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // Insert default simulation set
        DB::table('simulation_sets')->insert([
            'id' => 1,
            'title' => 'TOEFL ITP Practice Test',
            'description' => 'Simulasi lengkap TOEFL ITP dengan 3 section: Listening, Structure, dan Reading',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_sets');
    }
};