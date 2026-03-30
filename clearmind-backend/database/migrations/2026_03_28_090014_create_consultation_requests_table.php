<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_requests', function (Blueprint $table) {
            $table->id();

            // Who submitted
            $table->foreignId('patient_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Assigned doctor (nullable until admin assigns one)
            $table->foreignId('doctor_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // Request details
            $table->string('concern', 500);
            $table->enum('urgency', ['low', 'normal', 'high', 'emergency'])->default('normal');

            // Preferred schedule (optional)
            $table->date('preferred_date')->nullable();
            $table->time('preferred_time')->nullable();

            // Type preference
            $table->enum('type', ['online', 'physical', 'any'])->default('any');

            // Status lifecycle
            $table->enum('status', [
                'pending',      // just submitted, waiting for admin review
                'reviewed',     // admin has seen it
                'approved',     // converted to appointment
                'rejected',     // rejected by admin
            ])->default('pending');

            // Admin notes / rejection reason
            $table->text('admin_notes')->nullable();

            // Link to appointment if approved
            $table->foreignId('appointment_id')
                  ->nullable()
                  ->constrained('appointments')
                  ->onDelete('set null');

            $table->timestamps();

            // Indexes for dashboard queries
            $table->index(['status', 'created_at']);
            $table->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_requests');
    }
};