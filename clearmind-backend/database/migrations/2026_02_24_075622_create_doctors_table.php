<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->unique(); // enforce 1:1

            // Doctor profile fields
            $table->string('prc_number')->nullable()->unique();
            $table->string('professional_title')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('years_of_experience')->nullable();
            $table->string('license_number')->nullable(); 
            $table->string('practicing_since')->nullable(); 
            $table->string('profile_picture')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};