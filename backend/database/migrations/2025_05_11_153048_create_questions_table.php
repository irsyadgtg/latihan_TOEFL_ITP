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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            
            //  FIXED: Hapus ->after('id') karena ini CREATE TABLE, bukan ALTER
            $table->unsignedBigInteger('group_id')->nullable();
            $table->foreign('group_id')->references('id')->on('questions')->onDelete('set null');
            
            // Original fields
            $table->foreignId('simulation_set_id')->nullable()->constrained('simulation_sets')->onDelete('cascade');
            $table->enum('modul', ['listening', 'structure', 'reading']);
            $table->unsignedTinyInteger('unit_number')->nullable(); 
            $table->text('question_text');
            $table->string('attachment')->nullable(); // audio/image/video opsional
            $table->string('option_a')->nullable();
            $table->string('option_b')->nullable();
            $table->string('option_c')->nullable();
            $table->string('option_d')->nullable();
            $table->enum('correct_option', ['a', 'b', 'c', 'd'])->nullable();
            $table->text('explanation')->nullable();
            
            //  REMOVED: difficulty field (dihapus sesuai migration remove_difficulty)
            // $table->enum('difficulty', ['A1', 'B1', 'B2', 'C1'])->nullable(); // REMOVED
            
            $table->unsignedSmallInteger('order_number')->nullable(); // untuk urutan soal
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //  OPTION 1: Full table drop (untuk migrate:fresh)
        Schema::dropIfExists('questions');
        
        /*  OPTION 2: Granular rollback (jika butuh rollback sebagian)
        Schema::table('questions', function (Blueprint $table) {
            // Drop foreign key dulu sebelum drop column
            $table->dropForeign(['group_id']);
            $table->dropColumn('group_id');
            
            // Restore difficulty field jika diperlukan
            // $table->enum('difficulty', ['A1', 'B1', 'B2', 'C1'])->nullable()->after('explanation');
        });
        */
    }
};