<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn('topic');
            $table->enum('status', ['pending', 'active', 'closed'])->default('pending')->change();
            $table->unique(['student_id', 'instructor_id']);
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('topic');
            $table->enum('status', ['active', 'closed'])->change();
            $table->dropUnique(['student_id', 'instructor_id']);
        });
    }
};