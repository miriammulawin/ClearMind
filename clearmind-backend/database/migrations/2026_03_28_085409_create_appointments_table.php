<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->foreignId('doctor_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->date('appointment_date');
            $table->time('appointment_time');

            $table->enum('type', ['online', 'physical'])->default('physical');

            $table->enum('status', [
                'pending',
                'confirmed',
                'completed',
                'cancelled',
                'no_show',
            ])->default('pending');

            $table->string('reason', 500)->nullable();
            $table->text('notes')->nullable();
            $table->string('cancellation_reason', 500)->nullable();

            $table->timestamps();

            $table->index(['appointment_date', 'status']);
            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};