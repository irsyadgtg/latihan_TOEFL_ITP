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
        Schema::create('notifikasi_admin', function (Blueprint $table) {
            $table->id('idNotifikasi');
            $table->string('pesan');
            $table->string('jenisNotifikasi');
            $table->boolean('sudahDibaca')->default(false);
            $table->timestamp('tglDibuat')->useCurrent();
            $table->string('sumberId');
            $table->string('sumberTipe');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_admin');
    }
};
