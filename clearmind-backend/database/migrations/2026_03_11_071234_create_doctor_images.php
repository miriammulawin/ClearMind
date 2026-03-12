<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create dedicated doctor_images table
        Schema::create('doctor_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade'); // delete images when doctor is deleted
            $table->enum('type', ['certificate', 'id_picture']);
            $table->string('path');       // storage path e.g. certificate_images/abc.jpg
            $table->timestamps();
        });

        // Remove the old JSON columns from doctors table
        Schema::table('doctors', function (Blueprint $table) {
            if (Schema::hasColumn('doctors', 'certificate_images')) {
                $table->dropColumn('certificate_images');
            }
            if (Schema::hasColumn('doctors', 'id_pictures')) {
                $table->dropColumn('id_pictures');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_images');

        Schema::table('doctors', function (Blueprint $table) {
            $table->json('certificate_images')->nullable();
            $table->json('id_pictures')->nullable();
        });
    }
};