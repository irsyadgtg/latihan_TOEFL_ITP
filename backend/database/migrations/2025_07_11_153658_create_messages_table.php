<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('consultation_id');
            $table->unsignedBigInteger('sender_id')->nullable(); // FIXED: Made nullable
            $table->text('message');
            $table->enum('message_type', ['chat', 'session_marker'])->default('chat');
            $table->string('attachment')->nullable();
            $table->unsignedBigInteger('reference_page_id')->nullable();
            $table->string('reference_modul')->nullable();
            $table->integer('reference_unit_number')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
            $table->foreign('sender_id')->references('idPengguna')->on('pengguna')->onDelete('set null'); // FIXED: set null
            $table->foreign('reference_page_id')->references('id')->on('pages')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};