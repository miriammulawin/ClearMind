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
           Schema::create('sub_specializations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('specialization_id')
                  ->constrained('specializations')
                  ->onDelete('cascade');
            $table->string('name'); // e.g., "Interventional Cardiology" (under Cardiology)
            $table->text('description')->nullable();
            $table->unique(['specialization_id', 'name']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_specializations');
    }
};
