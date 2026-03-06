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
            $table->foreignId('client_id')
                  ->constrained('clients')
                  ->onDelete('cascade');
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('visit_type', ['Online', 'Physical'])->default('Online');
            $table->enum('status', ['Pending', 'Scheduled', 'Cancelled', 'Completed'])
                  ->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};