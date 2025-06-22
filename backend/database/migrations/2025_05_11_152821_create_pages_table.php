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
    Schema::create('pages', function (Blueprint $table) {
        $table->id();
        $table->enum('modul', ['listening', 'structure', 'reading']);
        $table->unsignedTinyInteger('unit_number'); // 0 = overview
        $table->unsignedSmallInteger('order_number'); // urutan page dalam unit
        $table->string('title');
        $table->string('attachment')->nullable(); // image/audio/video
        $table->text('description')->nullable();
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
