<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
{
    Schema::table('doctors', function (Blueprint $table) {
        if (!Schema::hasColumn('doctors', 'certificate_images')) {
            $table->json('certificate_images')->nullable();
        }
        if (!Schema::hasColumn('doctors', 'id_pictures')) {
            $table->json('id_pictures')->nullable();
        }
    });
}

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn(['certificate_images', 'id_pictures']);
        });
    }
};