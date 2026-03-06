<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Doctor to Specializations (Many-to-Many)
        Schema::create('doctor_specializations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade');
            $table->foreignId('specialization_id')
                  ->constrained('specializations')
                  ->onDelete('cascade');
            $table->boolean('is_main')->default(false); // Mark main specialization
            $table->unique(['doctor_id', 'specialization_id']);
            $table->timestamps();
        });

        // Doctor to Sub-Specializations (Many-to-Many)
        Schema::create('doctor_sub_specializations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade');
            $table->foreignId('sub_specialization_id')
                  ->constrained('sub_specializations')
                  ->onDelete('cascade');
            $table->unique(['doctor_id', 'sub_specialization_id'], 'uq_doc_subspec');
            $table->timestamps();
        });

        // Doctor to Services (Many-to-Many)
        Schema::create('doctor_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade');
            $table->foreignId('service_id')
                  ->constrained('services')
                  ->onDelete('cascade');
            $table->unique(['doctor_id', 'service_id']);
            $table->timestamps();
        });

        Schema::create('doctor_board_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                  ->constrained('doctors')
                  ->onDelete('cascade');
            $table->foreignId('board_certificate_id')
                  ->constrained('board_certificates')
                  ->onDelete('cascade');
            $table->string('certificate_number')->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('certificate_image')->nullable();
            $table->unique(['doctor_id', 'board_certificate_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_board_certificates');
        Schema::dropIfExists('doctor_services');
        Schema::dropIfExists('doctor_sub_specializations');
        Schema::dropIfExists('doctor_specializations');
    }
};