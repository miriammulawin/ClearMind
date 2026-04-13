<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id');

            $table->unsignedBigInteger('booked_by_user_id')->nullable();
            $table->foreign('booked_by_user_id')->references('id')->on('users')->nullOnDelete();

            $table->unsignedBigInteger('patient_id');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->cascadeOnDelete();

            $table->string('informant_name', 200)->nullable();
            $table->string('informant_relation', 100)->nullable();

            $table->unsignedBigInteger('doctor_user_id')->nullable();
            $table->foreign('doctor_user_id')->references('id')->on('users')->nullOnDelete();

            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');

            $table->enum('visit_type', ['onsite', 'virtual'])->default('onsite');
            $table->string('reason_for_consultation', 500)->nullable();
            $table->string('service_type', 100)->nullable();
            $table->string('pae_purpose', 200)->nullable();

            $table->enum('payment_status', ['paid', 'not_paid', 'probono'])->default('not_paid');
            $table->json('receipt_paths')->nullable();

            // ── Reference number — generated only when payment_status = paid ──
            $table->string('reference_number', 100)->nullable()->unique();

            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
                  ->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};