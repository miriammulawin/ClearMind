<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->unique();

            $table->foreignId('doctor_id')   // ← ADDED directly here
                  ->nullable()
                  ->constrained('doctors')
                  ->nullOnDelete();

            $table->enum('appointment_status', ['Pending', 'Scheduled', 'Cancelled', 'Completed'])
                  ->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};