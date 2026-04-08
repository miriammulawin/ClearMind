<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id('doctor_id');
            $table->unsignedBigInteger('user_id')->unique();
           $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('prc_number', 255)->nullable()->unique();
            $table->string('professional_title', 255)->nullable();
            $table->text('description')->nullable();
            $table->integer('years_of_experience')->nullable();
            $table->string('license_number', 255)->nullable()->unique();
            $table->string('practicing_since', 255)->nullable();
            $table->string('profile_picture', 255)->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->timestamp('profile_completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};